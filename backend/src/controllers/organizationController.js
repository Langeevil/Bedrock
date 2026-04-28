import pool from "../db.js";
import {
  ORGANIZATION_ROLES,
  PERMISSIONS,
  buildAuthSummary,
  canAssignOrganizationRole,
  hasPermission,
  isSystemAdmin,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";
import { resolveAuthContext } from "../auth/authContext.js";

const EXTENDED_DIRECTORY_ROLES = new Set([
  ORGANIZATION_ROLES.ORGANIZATION_OWNER,
  ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
  ORGANIZATION_ROLES.COORDINATOR,
]);

function sanitizeDomain(domain) {
  return String(domain || "").trim().toLowerCase().replace(/^@+/, "");
}

function canUseExtendedDirectoryScope(auth) {
  if (isSystemAdmin(auth)) return true;
  const role = normalizeOrganizationRole(auth?.membership?.role);
  return role ? EXTENDED_DIRECTORY_ROLES.has(role) : false;
}

async function getOrganizationDomains(organizationId) {
  const result = await pool.query(
    `SELECT id, domain, is_primary, created_at
     FROM organization_domains
     WHERE organization_id = $1
     ORDER BY is_primary DESC, LOWER(domain) ASC`,
    [organizationId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    domain: row.domain,
    is_primary: row.is_primary,
    created_at: row.created_at,
  }));
}

export async function getCurrentOrganization(req, res) {
  if (!req.auth?.organization) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  try {
    const organizationResult = await pool.query(
      `SELECT id, name, slug, directory_visibility
       FROM organizations
       WHERE id = $1`,
      [req.auth.organization.id]
    );

    const domains = await getOrganizationDomains(req.auth.organization.id);

    return res.json({
      ...(organizationResult.rows[0] || req.auth.organization),
      membership: req.auth.membership,
      authz: buildAuthSummary(req.auth),
      domains,
      allowed_directory_scopes: canUseExtendedDirectoryScope(req.auth)
        ? ["organization", "external", "all"]
        : ["organization"],
    });
  } catch (err) {
    console.error("Erro ao buscar organizacao atual:", err);
    return res.status(500).json({ error: "Erro ao carregar organizacao atual." });
  }
}

export async function getCurrentOrganizationTenancy(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  try {
    const [organizationResult, domains, memberCountResult] = await Promise.all([
      pool.query(
        `SELECT id, name, slug, directory_visibility, created_at, updated_at
         FROM organizations
         WHERE id = $1`,
        [req.auth.organization.id]
      ),
      getOrganizationDomains(req.auth.organization.id),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM organization_memberships
         WHERE organization_id = $1
           AND status = 'active'`,
        [req.auth.organization.id]
      ),
    ]);

    const organization = organizationResult.rows[0];

    if (!organization) {
      return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
    }

    return res.json({
      ...organization,
      active_members: Number(memberCountResult.rows[0]?.count || 0),
      domains,
      allowed_directory_scopes: canUseExtendedDirectoryScope(req.auth)
        ? ["organization", "external", "all"]
        : ["organization"],
    });
  } catch (err) {
    console.error("Erro ao buscar tenancy da organizacao:", err);
    return res.status(500).json({ error: "Erro ao carregar tenancy da organizacao." });
  }
}

export async function updateCurrentOrganizationTenancy(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  if (!hasPermission(req.auth, PERMISSIONS.ORGANIZATION_MANAGE)) {
    return res.status(403).json({ error: "Sem permissao para gerenciar tenancy." });
  }

  const visibility = String(req.body?.directory_visibility || "").trim().toLowerCase();
  const hasDomainsPayload = Object.prototype.hasOwnProperty.call(req.body || {}, "domains");
  const domainsInput = Array.isArray(req.body?.domains) ? req.body.domains : [];
  const normalizedDomains = [...new Set(domainsInput.map(sanitizeDomain).filter(Boolean))];

  if (visibility && !["organization", "network", "public"].includes(visibility)) {
    return res.status(400).json({ error: "Visibilidade de diretorio invalida." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (visibility) {
      await client.query(
        `UPDATE organizations
         SET directory_visibility = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [req.auth.organization.id, visibility]
      );
    }

    if (hasDomainsPayload) {
      await client.query(
        `DELETE FROM organization_domains
         WHERE organization_id = $1`,
        [req.auth.organization.id]
      );

      for (const [index, domain] of normalizedDomains.entries()) {
        await client.query(
          `INSERT INTO organization_domains (organization_id, domain, is_primary)
           VALUES ($1, $2, $3)`,
          [req.auth.organization.id, domain, index === 0]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao atualizar tenancy da organizacao:", err);
    return res.status(500).json({ error: "Erro ao atualizar tenancy da organizacao." });
  } finally {
    client.release();
  }

  return getCurrentOrganizationTenancy(req, res);
}

export async function listCurrentOrganizationDirectory(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  if (!hasPermission(req.auth, PERMISSIONS.USER_VIEW_DIRECTORY)) {
    return res.status(403).json({ error: "Sem permissao para visualizar o diretorio." });
  }

  const query = String(req.query.q || "").trim().toLowerCase();
  const roleFilter = normalizeOrganizationRole(req.query.role);
  const requestedScope = String(req.query.scope || "organization").trim().toLowerCase();
  const allowedExtendedScope = canUseExtendedDirectoryScope(req.auth);
  const scope =
    requestedScope === "external" || requestedScope === "all"
      ? allowedExtendedScope
        ? requestedScope
        : "organization"
      : "organization";

  const currentOrganizationId = req.auth.organization.id;
  const pattern = query ? `%${query}%` : "%";
  const domainLike = query && !query.includes("@") ? `%@${query}%` : null;

  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.nome,
         u.email,
         u.system_role,
         u.role AS effective_role,
         u.account_status,
         om.role AS organization_role,
         om.status AS membership_status,
         o.id AS organization_id,
         o.name AS organization_name,
         o.slug AS organization_slug,
         o.directory_visibility,
         COALESCE(p.status, 'offline') AS presence_status
       FROM users u
       JOIN organization_memberships om
         ON om.user_id = u.id
        AND om.status = 'active'
       JOIN organizations o
         ON o.id = om.organization_id
       LEFT JOIN chat_user_presence p
         ON p.user_id = u.id
       WHERE COALESCE(u.account_status, 'active') = 'active'
         AND (
           $1::text = 'all'
           OR ($1::text = 'organization' AND om.organization_id = $2)
           OR ($1::text = 'external' AND om.organization_id <> $2)
         )
         AND ($3::text IS NULL OR om.role = $3)
         AND (
           $4::text = ''
           OR LOWER(u.nome) LIKE $5
           OR LOWER(u.email) LIKE $5
           OR ($6::text IS NOT NULL AND LOWER(u.email) LIKE $6)
         )
       ORDER BY
         CASE WHEN om.organization_id = $2 THEN 0 ELSE 1 END,
         LOWER(o.name),
         LOWER(u.nome),
         LOWER(u.email)
       LIMIT 80`,
      [scope, currentOrganizationId, roleFilter || null, query, pattern, domainLike]
    );

    return res.json(
      result.rows.map((row) => ({
        id: Number(row.id),
        nome: row.nome,
        email: row.email,
        system_role: row.system_role,
        effective_role: row.effective_role,
        organization_role: row.organization_role,
        membership_status: row.membership_status,
        account_status: row.account_status,
        organization: {
          id: Number(row.organization_id),
          name: row.organization_name,
          slug: row.organization_slug,
          directory_visibility: row.directory_visibility,
        },
        scope:
          Number(row.organization_id) === currentOrganizationId
            ? "current_organization"
            : "external_organization",
        presence_status: row.presence_status,
      }))
    );
  } catch (err) {
    console.error("Erro ao listar diretorio da organizacao:", err);
    return res.status(500).json({ error: "Erro ao carregar diretorio." });
  }
}

export async function listCurrentOrganizationMembers(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.nome,
         u.email,
         u.system_role,
         u.role AS effective_role,
         u.account_status,
         m.role AS organization_role,
         m.status AS membership_status,
         m.joined_at
       FROM organization_memberships m
       JOIN users u ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY
         CASE m.role
           WHEN $2 THEN 0
           WHEN $3 THEN 1
           WHEN $4 THEN 2
           WHEN $5 THEN 3
           WHEN $6 THEN 4
           ELSE 5
         END,
         LOWER(u.nome),
         LOWER(u.email)`,
      [
        req.auth.organization.id,
        ORGANIZATION_ROLES.ORGANIZATION_OWNER,
        ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
        ORGANIZATION_ROLES.COORDINATOR,
        ORGANIZATION_ROLES.PROFESSOR,
        ORGANIZATION_ROLES.STUDENT,
      ]
    );

    return res.json(
      result.rows.map((row) => ({
        id: Number(row.id),
        nome: row.nome,
        email: row.email,
        system_role: row.system_role,
        effective_role: row.effective_role,
        organization_role: row.organization_role,
        account_status: row.account_status,
        membership_status: row.membership_status,
        joined_at: row.joined_at,
      }))
    );
  } catch (err) {
    console.error("Erro ao listar membros da organizacao:", err);
    return res.status(500).json({ error: "Erro ao listar membros." });
  }
}

export async function updateCurrentOrganizationMemberRole(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  if (!hasPermission(req.auth, PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS)) {
    return res.status(403).json({ error: "Sem permissao para gerenciar membros." });
  }

  const targetUserId = Number(req.params.userId);
  const nextRole = normalizeOrganizationRole(req.body?.role);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ error: "Usuario invalido." });
  }

  if (!nextRole) {
    return res.status(400).json({ error: "Papel invalido." });
  }

  if (!canAssignOrganizationRole(req.auth, nextRole)) {
    return res.status(403).json({ error: "Sem permissao para atribuir este papel." });
  }

  try {
    const membership = await pool.query(
      `SELECT role
       FROM organization_memberships
       WHERE organization_id = $1
         AND user_id = $2`,
      [req.auth.organization.id, targetUserId]
    );

    if (membership.rows.length === 0) {
      return res.status(404).json({ error: "Membro nao encontrado." });
    }

    const currentRole = normalizeOrganizationRole(membership.rows[0].role);

    if (
      currentRole === ORGANIZATION_ROLES.ORGANIZATION_OWNER &&
      req.auth.userId !== targetUserId &&
      !canAssignOrganizationRole(req.auth, currentRole)
    ) {
      return res.status(403).json({ error: "Nao e possivel alterar este membro." });
    }

    await pool.query(
      `UPDATE organization_memberships
       SET role = $3
       WHERE organization_id = $1
         AND user_id = $2`,
      [req.auth.organization.id, targetUserId, nextRole]
    );

    await pool.query(
      `UPDATE users
       SET role = $2
       WHERE id = $1`,
      [targetUserId, nextRole]
    );

    const auth = await resolveAuthContext(targetUserId);

    return res.json({
      message: "Papel atualizado com sucesso.",
      usuario: auth
        ? {
            id: auth.userId,
            nome: auth.nome,
            email: auth.email,
            role: auth.effectiveRole,
            system_role: auth.systemRole,
            organization: auth.organization,
            membership: auth.membership,
          }
        : null,
    });
  } catch (err) {
    console.error("Erro ao atualizar papel do membro:", err);
    return res.status(500).json({ error: "Erro ao atualizar papel." });
  }
}

export async function addCurrentOrganizationMember(req, res) {
  if (!req.auth?.organization?.id) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  if (!hasPermission(req.auth, PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS)) {
    return res.status(403).json({ error: "Sem permissao para gerenciar membros." });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const nextRole = normalizeOrganizationRole(req.body?.role) || ORGANIZATION_ROLES.STUDENT;

  if (!email) {
    return res.status(400).json({ error: "Email obrigatorio." });
  }

  if (!canAssignOrganizationRole(req.auth, nextRole)) {
    return res.status(403).json({ error: "Sem permissao para atribuir este papel." });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, primary_organization_id
       FROM users
       WHERE LOWER(email) = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    const user = userResult.rows[0];
    const primaryOrganizationId = Number(user.primary_organization_id || 0);

    if (
      primaryOrganizationId > 0 &&
      primaryOrganizationId !== req.auth.organization.id
    ) {
      return res.status(400).json({
        error: "Usuario ja possui outra organizacao primaria. Migracao de organizacao ainda nao suportada.",
      });
    }

    await pool.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status`,
      [req.auth.organization.id, user.id, nextRole]
    );

    await pool.query(
      `UPDATE users
       SET role = $2,
           primary_organization_id = COALESCE(primary_organization_id, $3)
       WHERE id = $1`,
      [user.id, nextRole, req.auth.organization.id]
    );

    const auth = await resolveAuthContext(user.id);

    return res.status(201).json({
      message: "Membro adicionado com sucesso.",
      usuario: auth
        ? {
            id: auth.userId,
            nome: auth.nome,
            email: auth.email,
            role: auth.effectiveRole,
            system_role: auth.systemRole,
            organization: auth.organization,
            membership: auth.membership,
          }
        : null,
    });
  } catch (err) {
    console.error("Erro ao adicionar membro da organizacao:", err);
    return res.status(500).json({ error: "Erro ao adicionar membro." });
  }
}
