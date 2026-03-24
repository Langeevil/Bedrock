import pool from "../db.js";
import {
  ORGANIZATION_ROLES,
  PERMISSIONS,
  buildAuthSummary,
  canAssignOrganizationRole,
  hasPermission,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";
import { resolveAuthContext } from "../auth/authContext.js";

export async function getCurrentOrganization(req, res) {
  if (!req.auth?.organization) {
    return res.status(404).json({ error: "Organizacao ativa nao encontrada." });
  }

  return res.json({
    ...req.auth.organization,
    membership: req.auth.membership,
    authz: buildAuthSummary(req.auth),
  });
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
