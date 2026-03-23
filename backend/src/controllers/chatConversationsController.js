import pool from "../db.js";
import {
  CHAT_TYPES,
  MEMBER_ROLES,
  getConversationAccess,
  getConversationMembers,
  getConversationSummary,
  listConversationsForUser,
} from "../chatCore.js";
import { PERMISSIONS, hasPermission } from "../auth/accessControl.js";

function normalizeMemberIds(rawIds, currentUserId) {
  const items = Array.isArray(rawIds) ? rawIds : [];
  const nextIds = new Set();

  for (const item of items) {
    const userId = Number(item);
    if (Number.isInteger(userId) && userId > 0 && userId !== currentUserId) {
      nextIds.add(userId);
    }
  }

  return [...nextIds];
}

async function userExists(userId, organizationId) {
  const result = await pool.query(
    `SELECT 1
     FROM organization_memberships
     WHERE user_id = $1
       AND organization_id = $2
       AND status = 'active'`,
    [userId, organizationId]
  );
  return result.rows.length > 0;
}

async function ensureRoleForConversation(auth, conversationId) {
  const access = await getConversationAccess(auth.userId, conversationId, {
    autoJoinPublicChannel: false,
    organizationId: auth.organization?.id || null,
    isSystemAdmin: auth.systemRole === "system_admin",
  });

  if (!access.found) {
    return { ok: false, status: 404, error: "Conversa nao encontrada." };
  }

  if (!access.memberRole) {
    return { ok: false, status: 403, error: "Sem permissao para alterar esta conversa." };
  }

  if (auth.systemRole === "system_admin") {
    return { ok: true, access };
  }

  if (![MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(access.memberRole)) {
    return { ok: false, status: 403, error: "Somente admin ou owner pode alterar esta conversa." };
  }

  return { ok: true, access };
}

async function buildConversationPayload(auth, conversationId) {
  const conversation = await getConversationSummary(auth.userId, conversationId, {
    organizationId: auth.organization?.id || null,
    isSystemAdmin: auth.systemRole === "system_admin",
  });
  if (!conversation) return null;

  const members = await getConversationMembers(conversationId);
  const membership = members.find((member) => member.id === auth.userId) || null;

  return {
    ...conversation,
    members,
    permissions: {
      can_manage_members:
        auth.systemRole === "system_admin" ||
        membership?.member_role === MEMBER_ROLES.OWNER ||
        membership?.member_role === MEMBER_ROLES.ADMIN,
      can_edit:
        auth.systemRole === "system_admin" ||
        membership?.member_role === MEMBER_ROLES.OWNER ||
        membership?.member_role === MEMBER_ROLES.ADMIN,
    },
  };
}

export async function listConversations(req, res) {
  try {
    const type = req.query.type ? String(req.query.type) : null;
    const includePublic = req.query.include_public !== "false";

    if (!hasPermission(req.auth, PERMISSIONS.CHAT_ACCESS)) {
      return res.status(403).json({ error: "Sem permissao para acessar o chat." });
    }

    if (type && !Object.values(CHAT_TYPES).includes(type)) {
      return res.status(400).json({ error: "Tipo de conversa invalido." });
    }

    const conversations = await listConversationsForUser(req.userId, {
      type,
      includePublic,
      organizationId: req.auth?.organization?.id || null,
      isSystemAdmin: req.auth?.systemRole === "system_admin",
    });

    return res.json(conversations);
  } catch (err) {
    console.error("Erro ao listar conversas:", err);
    return res.status(500).json({ error: "Erro ao listar conversas." });
  }
}

export async function createDirectConversation(req, res) {
  if (!hasPermission(req.auth, PERMISSIONS.CHAT_CREATE_DIRECT)) {
    return res.status(403).json({ error: "Sem permissao para iniciar conversas diretas." });
  }

  const targetUserId = Number(req.body?.targetUserId);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ error: "Usuario alvo invalido." });
  }

  if (targetUserId === req.userId) {
    return res.status(400).json({ error: "Nao e possivel iniciar conversa com voce mesmo." });
  }

  try {
    if (!(await userExists(targetUserId, req.auth?.organization?.id))) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    const [userLowId, userHighId] = [req.userId, targetUserId].sort((a, b) => a - b);

    const existing = await pool.query(
      `SELECT conversation_id
       FROM chat_direct_pairs
       WHERE user_low_id = $1
         AND user_high_id = $2`,
      [userLowId, userHighId]
    );

    let conversationId = Number(existing.rows[0]?.conversation_id || 0);

    if (!conversationId) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const maybeExisting = await client.query(
          `SELECT conversation_id
           FROM chat_direct_pairs
           WHERE user_low_id = $1
             AND user_high_id = $2
           FOR UPDATE`,
          [userLowId, userHighId]
        );

        conversationId = Number(maybeExisting.rows[0]?.conversation_id || 0);

        if (!conversationId) {
          const createdConversation = await client.query(
            `INSERT INTO chat_conversations (type, is_private, created_by, organization_id)
             VALUES ($1, TRUE, $2, $3)
             RETURNING id`,
            [CHAT_TYPES.DIRECT, req.userId, req.auth.organization.id]
          );

          conversationId = Number(createdConversation.rows[0].id);

          await client.query(
            `INSERT INTO chat_conversation_members (conversation_id, user_id, role)
             VALUES
               ($1, $2, $4),
               ($1, $3, $4)`,
            [conversationId, req.userId, targetUserId, MEMBER_ROLES.MEMBER]
          );

          await client.query(
            `INSERT INTO chat_direct_pairs (conversation_id, user_low_id, user_high_id)
             VALUES ($1, $2, $3)`,
            [conversationId, userLowId, userHighId]
          );
        }

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.status(existing.rows.length > 0 ? 200 : 201).json(payload);
  } catch (err) {
    console.error("Erro ao criar conversa direta:", err);
    return res.status(500).json({ error: "Erro ao criar conversa direta." });
  }
}

export async function createConversation(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(400).json({ error: "Usuario sem organizacao ativa." });
  }

  const type = String(req.body?.type || "").trim().toLowerCase();
  const name = String(req.body?.name || "").trim();
  const description = String(req.body?.description || "").trim() || null;
  const memberIds = normalizeMemberIds(req.body?.memberIds, req.userId);

  if (![CHAT_TYPES.GROUP, CHAT_TYPES.CHANNEL].includes(type)) {
    return res.status(400).json({ error: "Tipo de conversa invalido." });
  }

  if (type === CHAT_TYPES.GROUP && !hasPermission(req.auth, PERMISSIONS.CHAT_CREATE_GROUP)) {
    return res.status(403).json({ error: "Sem permissao para criar grupos." });
  }

  if (type === CHAT_TYPES.CHANNEL && !hasPermission(req.auth, PERMISSIONS.CHAT_CREATE_CHANNEL)) {
    return res.status(403).json({ error: "Sem permissao para criar canais." });
  }

  if (!name) {
    return res.status(400).json({ error: "Informe o nome da conversa." });
  }

  const isPrivate = type === CHAT_TYPES.GROUP ? true : req.body?.is_private !== false;

  try {
    const invalidMembers = [];
    for (const userId of memberIds) {
      if (!(await userExists(userId, req.auth.organization.id))) {
        invalidMembers.push(userId);
      }
    }

    if (invalidMembers.length > 0) {
      return res.status(400).json({ error: "Alguns membros informados nao existem." });
    }

    const client = await pool.connect();

    let conversationId = 0;

    try {
      await client.query("BEGIN");

      const createdConversation = await client.query(
        `INSERT INTO chat_conversations (type, name, description, is_private, created_by, organization_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [type, name, description, isPrivate, req.userId, req.auth.organization.id]
      );

      conversationId = Number(createdConversation.rows[0].id);

      await client.query(
        `INSERT INTO chat_conversation_members (conversation_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [conversationId, req.userId, MEMBER_ROLES.OWNER]
      );

      if (memberIds.length > 0) {
        const params = [];
        const values = [];
        let index = 1;

        for (const userId of memberIds) {
          params.push(`($${index}, $${index + 1}, $${index + 2})`);
          values.push(conversationId, userId, MEMBER_ROLES.MEMBER);
          index += 3;
        }

        await client.query(
          `INSERT INTO chat_conversation_members (conversation_id, user_id, role)
           VALUES ${params.join(", ")}
           ON CONFLICT (conversation_id, user_id) DO NOTHING`,
          values
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.status(201).json(payload);
  } catch (err) {
    console.error("Erro ao criar conversa:", err);
    return res.status(500).json({ error: "Erro ao criar conversa." });
  }
}

export async function getConversationDetails(req, res) {
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  try {
    const access = await getConversationAccess(req.userId, conversationId, {
      autoJoinPublicChannel: true,
      organizationId: req.auth?.organization?.id || null,
      isSystemAdmin: req.auth?.systemRole === "system_admin",
    });

    if (!access.found) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    if (!access.allowed) {
      return res.status(403).json({ error: "Sem acesso a esta conversa." });
    }

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.json(payload);
  } catch (err) {
    console.error("Erro ao buscar detalhes da conversa:", err);
    return res.status(500).json({ error: "Erro ao buscar detalhes da conversa." });
  }
}

export async function updateConversation(req, res) {
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  try {
    const roleCheck = await ensureRoleForConversation(req.auth, conversationId);
    if (!roleCheck.ok) {
      return res.status(roleCheck.status).json({ error: roleCheck.error });
    }

    const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined;
    const description =
      req.body?.description !== undefined
        ? String(req.body.description || "").trim() || null
        : undefined;

    const current = roleCheck.access.conversation;

    let isPrivate = current.is_private;
    if (
      req.body?.is_private !== undefined &&
      current.type === CHAT_TYPES.CHANNEL
    ) {
      isPrivate = req.body.is_private !== false;
    }

    if (name !== undefined && !name && current.type !== CHAT_TYPES.DIRECT) {
      return res.status(400).json({ error: "Informe um nome valido." });
    }

    await pool.query(
      `UPDATE chat_conversations
       SET name = $2,
           description = $3,
           is_private = $4,
           updated_at = NOW()
       WHERE id = $1`,
      [
        conversationId,
        name !== undefined ? name : current.name,
        description !== undefined ? description : current.description,
        isPrivate,
      ]
    );

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.json(payload);
  } catch (err) {
    console.error("Erro ao atualizar conversa:", err);
    return res.status(500).json({ error: "Erro ao atualizar conversa." });
  }
}

export async function addConversationMembers(req, res) {
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  const userIds = normalizeMemberIds(req.body?.userIds, req.userId);
  if (userIds.length === 0) {
    return res.status(400).json({ error: "Informe ao menos um membro." });
  }

  try {
    const roleCheck = await ensureRoleForConversation(req.auth, conversationId);
    if (!roleCheck.ok) {
      return res.status(roleCheck.status).json({ error: roleCheck.error });
    }

    if (roleCheck.access.conversation.type === CHAT_TYPES.DIRECT) {
      return res.status(400).json({ error: "Nao e possivel adicionar membros em conversa direta." });
    }

    for (const userId of userIds) {
      if (!(await userExists(userId, req.auth.organization.id))) {
        return res.status(400).json({ error: "Um dos usuarios informados nao existe." });
      }
    }

    const params = [];
    const values = [];
    let index = 1;

    for (const userId of userIds) {
      params.push(`($${index}, $${index + 1}, $${index + 2})`);
      values.push(conversationId, userId, MEMBER_ROLES.MEMBER);
      index += 3;
    }

    await pool.query(
      `INSERT INTO chat_conversation_members (conversation_id, user_id, role)
       VALUES ${params.join(", ")}
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      values
    );

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.json(payload);
  } catch (err) {
    console.error("Erro ao adicionar membros:", err);
    return res.status(500).json({ error: "Erro ao adicionar membros." });
  }
}

export async function removeConversationMember(req, res) {
  const conversationId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ error: "Usuario invalido." });
  }

  try {
    const access = await getConversationAccess(req.userId, conversationId, {
      autoJoinPublicChannel: false,
      organizationId: req.auth?.organization?.id || null,
      isSystemAdmin: req.auth?.systemRole === "system_admin",
    });

    if (!access.found) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    if (access.conversation.type === CHAT_TYPES.DIRECT) {
      return res.status(400).json({ error: "Nao e possivel remover membros de conversa direta." });
    }

    const isSelfRemoval = targetUserId === req.userId;
    const canManageOthers =
      access.memberRole === MEMBER_ROLES.OWNER || access.memberRole === MEMBER_ROLES.ADMIN;

    if (!isSelfRemoval && !canManageOthers) {
      return res.status(403).json({ error: "Sem permissao para remover este membro." });
    }

    const targetMembership = await pool.query(
      `SELECT role
       FROM chat_conversation_members
       WHERE conversation_id = $1
         AND user_id = $2`,
      [conversationId, targetUserId]
    );

    if (targetMembership.rows.length === 0) {
      return res.status(404).json({ error: "Membro nao encontrado." });
    }

    if (targetMembership.rows[0].role === MEMBER_ROLES.OWNER) {
      const owners = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM chat_conversation_members
         WHERE conversation_id = $1
           AND role = $2`,
        [conversationId, MEMBER_ROLES.OWNER]
      );

      if (Number(owners.rows[0]?.count || 0) <= 1) {
        return res.status(400).json({ error: "Nao e possivel remover o ultimo owner." });
      }
    }

    await pool.query(
      `DELETE FROM chat_conversation_members
       WHERE conversation_id = $1
         AND user_id = $2`,
      [conversationId, targetUserId]
    );

    if (targetUserId === req.userId) {
      return res.json({ success: true, removed_self: true });
    }

    const payload = await buildConversationPayload(req.auth, conversationId);
    return res.json(payload);
  } catch (err) {
    console.error("Erro ao remover membro:", err);
    return res.status(500).json({ error: "Erro ao remover membro." });
  }
}
