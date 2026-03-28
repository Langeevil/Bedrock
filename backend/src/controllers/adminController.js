import pool from "../db.js";
import {
  ORGANIZATION_ROLES,
  canAssignOrganizationRole,
  hasPermission,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";
import { resolveAuthContext } from "../auth/authContext.js";

function isSystemAdmin(auth) {
  return auth?.systemRole === "system_admin";
}

function isOrganizationAdmin(auth) {
  return [
    ORGANIZATION_ROLES.ORGANIZATION_OWNER,
    ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
  ].includes(auth?.membership?.role);
}

function canOpenAdminPanel(auth) {
  return isSystemAdmin(auth) || isOrganizationAdmin(auth);
}

export async function getAdminSummary(req, res) {
  if (!canOpenAdminPanel(req.auth)) {
    return res.status(403).json({ error: "Sem permissao para acessar a area administrativa." });
  }

  try {
    const organizationId = req.auth.organization?.id || null;

    const [usersCount, orgCount, activeCount] = await Promise.all([
      isSystemAdmin(req.auth)
        ? pool.query("SELECT COUNT(*)::int AS count FROM users")
        : pool.query(
            `SELECT COUNT(*)::int AS count
             FROM organization_memberships
             WHERE organization_id = $1`,
            [organizationId]
          ),
      isSystemAdmin(req.auth)
        ? pool.query("SELECT COUNT(*)::int AS count FROM organizations")
        : Promise.resolve({ rows: [{ count: organizationId ? 1 : 0 }] }),
      isSystemAdmin(req.auth)
        ? pool.query("SELECT COUNT(*)::int AS count FROM users WHERE account_status = 'active'")
        : pool.query(
            `SELECT COUNT(*)::int AS count
             FROM organization_memberships om
             JOIN users u ON u.id = om.user_id
             WHERE om.organization_id = $1
               AND u.account_status = 'active'`,
            [organizationId]
          ),
    ]);

    return res.json({
      scope: isSystemAdmin(req.auth) ? "system" : "organization",
      total_users: Number(usersCount.rows[0]?.count || 0),
      total_organizations: Number(orgCount.rows[0]?.count || 0),
      active_users: Number(activeCount.rows[0]?.count || 0),
    });
  } catch (err) {
    console.error("Erro ao carregar resumo administrativo:", err);
    return res.status(500).json({ error: "Erro ao carregar resumo administrativo." });
  }
}

export async function listAdminUsers(req, res) {
  if (!canOpenAdminPanel(req.auth)) {
    return res.status(403).json({ error: "Sem permissao para listar usuarios." });
  }

  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    const scope = isSystemAdmin(req.auth) ? String(req.query.scope || "all") : "current_org";
    const like = `%${query}%`;
    const params = [];
    const where = [];

    let sql = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.role,
        u.system_role,
        u.account_status,
        u.primary_organization_id,
        o.name AS organization_name,
        o.slug AS organization_slug,
        om.role AS organization_role,
        om.status AS membership_status
      FROM users u
      LEFT JOIN organizations o ON o.id = u.primary_organization_id
      LEFT JOIN organization_memberships om
        ON om.user_id = u.id
       AND om.organization_id = u.primary_organization_id
    `;

    if (!isSystemAdmin(req.auth) || scope === "current_org") {
      params.push(req.auth.organization.id);
      where.push(`u.primary_organization_id = $${params.length}`);
    }

    if (query) {
      params.push(like);
      const idx = params.length;
      where.push(`(LOWER(u.nome) LIKE $${idx} OR LOWER(u.email) LIKE $${idx})`);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += " ORDER BY LOWER(u.nome), LOWER(u.email)";

    const result = await pool.query(sql, params);
    return res.json(
      result.rows.map((row) => ({
        id: Number(row.id),
        nome: row.nome,
        email: row.email,
        role: row.role,
        system_role: row.system_role,
        account_status: row.account_status,
        organization: row.primary_organization_id
          ? {
              id: Number(row.primary_organization_id),
              name: row.organization_name,
              slug: row.organization_slug,
            }
          : null,
        membership: row.primary_organization_id
          ? {
              organization_id: Number(row.primary_organization_id),
              role: row.organization_role,
              status: row.membership_status,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error("Erro ao listar usuarios admin:", err);
    return res.status(500).json({ error: "Erro ao listar usuarios." });
  }
}

export async function updateAdminUser(req, res) {
  if (!canOpenAdminPanel(req.auth)) {
    return res.status(403).json({ error: "Sem permissao para administrar usuarios." });
  }

  const targetUserId = Number(req.params.userId);
  const nextStatus = req.body?.account_status
    ? String(req.body.account_status).trim().toLowerCase()
    : undefined;
  const nextOrgRole = req.body?.organization_role
    ? normalizeOrganizationRole(req.body.organization_role)
    : undefined;
  const nextSystemRole = req.body?.system_role !== undefined
    ? String(req.body.system_role || "").trim().toLowerCase() || null
    : undefined;

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ error: "Usuario invalido." });
  }

  if (
    nextStatus !== undefined &&
    !["active", "inactive", "suspended"].includes(nextStatus)
  ) {
    return res.status(400).json({ error: "Status de conta invalido." });
  }

  if (nextOrgRole && !canAssignOrganizationRole(req.auth, nextOrgRole)) {
    return res.status(403).json({ error: "Sem permissao para atribuir este papel." });
  }

  if (nextSystemRole !== undefined && !isSystemAdmin(req.auth)) {
    return res.status(403).json({ error: "Somente system_admin pode alterar system_role." });
  }

  try {
    const targetAuth = await resolveAuthContext(targetUserId);
    if (!targetAuth) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    if (
      !isSystemAdmin(req.auth) &&
      targetAuth.organization?.id !== req.auth.organization?.id
    ) {
      return res.status(403).json({ error: "Usuario fora da organizacao ativa." });
    }

    if (nextStatus !== undefined) {
      await pool.query(
        `UPDATE users
         SET account_status = $2
         WHERE id = $1`,
        [targetUserId, nextStatus]
      );
    }

    if (nextOrgRole) {
      await pool.query(
        `UPDATE organization_memberships
         SET role = $3
         WHERE organization_id = $1
           AND user_id = $2`,
        [targetAuth.organization.id, targetUserId, nextOrgRole]
      );

      await pool.query(
        `UPDATE users
         SET role = $2
         WHERE id = $1`,
        [targetUserId, nextOrgRole]
      );
    }

    if (nextSystemRole !== undefined) {
      await pool.query(
        `UPDATE users
         SET system_role = $2
         WHERE id = $1`,
        [targetUserId, nextSystemRole]
      );
    }

    const updated = await resolveAuthContext(targetUserId);
    return res.json({
      message: "Usuario atualizado com sucesso.",
      usuario: {
        id: updated.userId,
        nome: updated.nome,
        email: updated.email,
        role: updated.effectiveRole,
        system_role: updated.systemRole,
        account_status: updated.accountStatus,
        organization: updated.organization,
        membership: updated.membership,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuario admin:", err);
    return res.status(500).json({ error: "Erro ao atualizar usuario." });
  }
}

export async function listAdminOrganizations(req, res) {
  if (!canOpenAdminPanel(req.auth)) {
    return res.status(403).json({ error: "Sem permissao para listar instituicoes." });
  }

  try {
    if (!isSystemAdmin(req.auth)) {
      return res.json(
        req.auth.organization
          ? [
              {
                ...req.auth.organization,
                can_manage: true,
              },
            ]
          : []
      );
    }

    const result = await pool.query(
      `SELECT
         o.id,
         o.name,
         o.slug,
         o.created_at,
         COUNT(om.user_id)::int AS members_count
       FROM organizations o
       LEFT JOIN organization_memberships om
         ON om.organization_id = o.id
       GROUP BY o.id
       ORDER BY LOWER(o.name)`
    );

    return res.json(
      result.rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        slug: row.slug,
        created_at: row.created_at,
        members_count: Number(row.members_count || 0),
        can_manage: true,
      }))
    );
  } catch (err) {
    console.error("Erro ao listar instituicoes admin:", err);
    return res.status(500).json({ error: "Erro ao listar instituicoes." });
  }
}

export async function createOrganization(req, res) {
  if (!isSystemAdmin(req.auth)) {
    return res.status(403).json({ error: "Somente system_admin pode criar instituicoes." });
  }

  const name = String(req.body?.name || "").trim();
  const slug = String(req.body?.slug || "").trim().toLowerCase();

  if (!name || !slug) {
    return res.status(400).json({ error: "Nome e slug sao obrigatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO organizations (name, slug, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, created_at`,
      [name, slug, req.userId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar instituicao:", err);
    return res.status(500).json({ error: "Erro ao criar instituicao." });
  }
}
