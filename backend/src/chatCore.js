import pool from "./db.js";

export const CHAT_TYPES = {
  DIRECT: "direct",
  GROUP: "group",
  CHANNEL: "channel",
};

export const MEMBER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
};

export const PRESENCE_STATUSES = new Set(["online", "away", "busy", "offline"]);

export function getConversationChannel(conversationId) {
  return `conversation:${conversationId}`;
}

export function normalizePresenceStatus(status) {
  const nextStatus = String(status || "").trim().toLowerCase();
  return PRESENCE_STATUSES.has(nextStatus) ? nextStatus : "online";
}

export async function listJoinedConversationIds(userId) {
  const result = await pool.query(
    "SELECT conversation_id FROM chat_conversation_members WHERE user_id = $1",
    [userId]
  );

  return result.rows.map((row) => Number(row.conversation_id)).filter(Boolean);
}

export async function upsertPresence(userId, status) {
  const normalized = normalizePresenceStatus(status);

  await pool.query(
    `INSERT INTO chat_user_presence (user_id, status, last_seen_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET status = EXCLUDED.status, last_seen_at = EXCLUDED.last_seen_at, updated_at = EXCLUDED.updated_at`,
    [userId, normalized]
  );

  return {
    user_id: userId,
    status: normalized,
  };
}

export async function getConversationAccess(userId, conversationId, options = {}) {
  const {
    autoJoinPublicChannel = false,
    organizationId = null,
    isSystemAdmin = false,
  } = options;

  const result = await pool.query(
    `SELECT
       c.id,
       c.type,
       c.name,
       c.description,
       c.is_private,
       c.created_by,
       m.role AS member_role
     FROM chat_conversations c
     LEFT JOIN chat_conversation_members m
       ON m.conversation_id = c.id
      AND m.user_id = $2
     WHERE c.id = $1
       AND ($3::boolean = TRUE OR c.organization_id = $4)
       AND c.archived_at IS NULL`,
    [conversationId, userId, isSystemAdmin, organizationId]
  );

  if (result.rows.length === 0) {
    return { found: false, allowed: false, conversation: null, memberRole: null };
  }

  const row = result.rows[0];
  const isMember = Boolean(row.member_role);
  const isPublicChannel =
    row.type === CHAT_TYPES.CHANNEL && row.is_private === false;

  if (isSystemAdmin) {
    return {
      found: true,
      allowed: true,
      conversation: row,
      memberRole: row.member_role || MEMBER_ROLES.OWNER,
      autoJoined: false,
    };
  }

  if (isMember) {
    return {
      found: true,
      allowed: true,
      conversation: row,
      memberRole: row.member_role,
      autoJoined: false,
    };
  }

  if (isPublicChannel && autoJoinPublicChannel) {
    await pool.query(
      `INSERT INTO chat_conversation_members (conversation_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      [conversationId, userId, MEMBER_ROLES.MEMBER]
    );

    return {
      found: true,
      allowed: true,
      conversation: row,
      memberRole: MEMBER_ROLES.MEMBER,
      autoJoined: true,
    };
  }

  return {
    found: true,
    allowed: isPublicChannel,
    conversation: row,
    memberRole: null,
    autoJoined: false,
  };
}

function mapConversationRow(row) {
  return {
    id: Number(row.id),
    type: row.type,
    name: row.name,
    description: row.description,
    is_private: row.is_private,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_preview: row.last_message_preview,
    last_message_at: row.last_message_at,
    unread_count: Number(row.unread_count || 0),
    member_count: Number(row.member_count || 0),
    counterpart: row.counterpart_id
      ? {
          id: Number(row.counterpart_id),
          nome: row.counterpart_nome,
          email: row.counterpart_email,
          presence_status: row.counterpart_presence_status || "offline",
        }
      : null,
  };
}

export async function listConversationsForUser(userId, options = {}) {
  const {
    type = null,
    includePublic = true,
    organizationId = null,
    isSystemAdmin = false,
  } = options;

  const result = await pool.query(
    `SELECT
       c.id,
       c.type,
       c.name,
       c.description,
       c.is_private,
       c.created_at,
       c.updated_at,
       lm.content AS last_message_preview,
       lm.created_at AS last_message_at,
       (
         SELECT COUNT(*)::int
         FROM chat_conversation_members total_members
         WHERE total_members.conversation_id = c.id
       ) AS member_count,
       COALESCE((
         SELECT COUNT(*)::int
         FROM chat_messages unread_messages
         LEFT JOIN chat_conversation_members current_member
           ON current_member.conversation_id = c.id
          AND current_member.user_id = $1
         WHERE unread_messages.conversation_id = c.id
           AND unread_messages.deleted_at IS NULL
           AND unread_messages.id > COALESCE(current_member.last_read_message_id, 0)
           AND unread_messages.sender_id <> $1
       ), 0) AS unread_count,
       counterpart.id AS counterpart_id,
       counterpart.nome AS counterpart_nome,
       counterpart.email AS counterpart_email,
       counterpart.presence_status AS counterpart_presence_status
     FROM chat_conversations c
     LEFT JOIN chat_conversation_members member_link
       ON member_link.conversation_id = c.id
      AND member_link.user_id = $1
     LEFT JOIN chat_messages lm
       ON lm.id = c.last_message_id
     LEFT JOIN LATERAL (
       SELECT
         u.id,
         u.nome,
         u.email,
         COALESCE(p.status, 'offline') AS presence_status
       FROM chat_conversation_members dm_member
       JOIN users u ON u.id = dm_member.user_id
       LEFT JOIN chat_user_presence p ON p.user_id = u.id
       WHERE dm_member.conversation_id = c.id
         AND dm_member.user_id <> $1
       LIMIT 1
     ) counterpart ON c.type = 'direct'
     WHERE c.archived_at IS NULL
       AND ($4::boolean = TRUE OR c.organization_id = $5)
       AND (
         member_link.user_id IS NOT NULL
         OR (
           $2 = TRUE
           AND c.type = 'channel'
           AND c.is_private = FALSE
         )
       )
       AND ($3::text IS NULL OR c.type = $3::text)
     ORDER BY COALESCE(lm.created_at, c.updated_at, c.created_at) DESC, c.id DESC`,
    [userId, includePublic, type, isSystemAdmin, organizationId]
  );

  return result.rows.map(mapConversationRow);
}

export async function getConversationSummary(userId, conversationId, options = {}) {
  const rows = await listConversationsForUser(userId, {
    includePublic: true,
    organizationId: options.organizationId,
    isSystemAdmin: options.isSystemAdmin,
  });
  return rows.find((row) => row.id === Number(conversationId)) || null;
}

export async function getConversationMembers(conversationId) {
  const result = await pool.query(
    `SELECT
       m.user_id AS id,
       u.nome,
       u.email,
       u.role,
       m.role AS member_role,
       m.joined_at,
       COALESCE(p.status, 'offline') AS presence_status
     FROM chat_conversation_members m
     JOIN users u ON u.id = m.user_id
     LEFT JOIN chat_user_presence p ON p.user_id = u.id
     WHERE m.conversation_id = $1
     ORDER BY
       CASE m.role
         WHEN 'owner' THEN 0
         WHEN 'admin' THEN 1
         ELSE 2
       END,
       LOWER(u.nome),
       LOWER(u.email)`,
    [conversationId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    nome: row.nome,
    email: row.email,
    role: row.role,
    member_role: row.member_role,
    joined_at: row.joined_at,
    presence_status: row.presence_status,
  }));
}

export async function createConversationMessage({
  conversationId,
  senderId,
  content,
  messageType = "text",
}) {
  const text = String(content || "").trim();
  if (!text) {
    throw new Error("Mensagem vazia.");
  }

  const type = String(messageType || "text").trim().toLowerCase() || "text";

  const created = await pool.query(
    `INSERT INTO chat_messages (conversation_id, sender_id, content, message_type)
     VALUES ($1, $2, $3, $4)
     RETURNING id, conversation_id, sender_id, content, message_type, created_at, edited_at, deleted_at`,
    [conversationId, senderId, text, type]
  );

  const message = created.rows[0];

  await pool.query(
    `UPDATE chat_conversations
     SET last_message_id = $2, updated_at = NOW()
     WHERE id = $1`,
    [conversationId, message.id]
  );

  const sender = await pool.query(
    "SELECT id, nome, email FROM users WHERE id = $1",
    [senderId]
  );

  return {
    id: Number(message.id),
    conversation_id: Number(message.conversation_id),
    sender_id: Number(message.sender_id),
    content: message.content,
    message_type: message.message_type,
    created_at: message.created_at,
    edited_at: message.edited_at,
    deleted_at: message.deleted_at,
    sender: {
      id: Number(sender.rows[0]?.id || senderId),
      nome: sender.rows[0]?.nome || "",
      email: sender.rows[0]?.email || "",
    },
    attachments: [],
  };
}

export async function markConversationRead(userId, conversationId, lastReadMessageId) {
  const messageId = Number(lastReadMessageId);
  if (!Number.isInteger(messageId) || messageId <= 0) {
    throw new Error("Mensagem invalida.");
  }

  const validMessage = await pool.query(
    `SELECT id
     FROM chat_messages
     WHERE id = $1
       AND conversation_id = $2`,
    [messageId, conversationId]
  );

  if (validMessage.rows.length === 0) {
    throw new Error("Mensagem invalida.");
  }

  await pool.query(
    `UPDATE chat_conversation_members
     SET last_read_message_id = $3,
         last_read_at = NOW()
     WHERE conversation_id = $1
       AND user_id = $2`,
    [conversationId, userId, messageId]
  );

  return {
    conversation_id: conversationId,
    user_id: userId,
    last_read_message_id: messageId,
  };
}

export async function getRelevantPresenceForUser(userId, options = {}) {
  const { organizationId = null, isSystemAdmin = false } = options;

  const result = await pool.query(
    `SELECT DISTINCT
       u.id,
       u.nome,
       u.email,
       COALESCE(p.status, 'offline') AS status,
       p.last_seen_at
     FROM users u
     JOIN chat_conversation_members my_membership
       ON my_membership.user_id = $1
     JOIN chat_conversation_members shared_membership
       ON shared_membership.conversation_id = my_membership.conversation_id
      AND shared_membership.user_id = u.id
     LEFT JOIN organization_memberships orgm
       ON orgm.user_id = u.id
     LEFT JOIN chat_user_presence p ON p.user_id = u.id
     WHERE u.id <> $1
       AND ($2::boolean = TRUE OR orgm.organization_id = $3)
     ORDER BY LOWER(u.nome), LOWER(u.email)`,
    [userId, isSystemAdmin, organizationId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    nome: row.nome,
    email: row.email,
    status: row.status,
    last_seen_at: row.last_seen_at,
  }));
}
