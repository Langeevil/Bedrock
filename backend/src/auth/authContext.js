import pool from "../db.js";
import {
  ORGANIZATION_ROLES,
  buildAuthSummary,
  normalizeOrganizationRole,
} from "./accessControl.js";

export async function resolveAuthContext(userId, client = pool) {
  const result = await client.query(
    `SELECT
       u.id,
       u.nome,
       u.email,
       u.role AS legacy_role,
       u.system_role,
       u.account_status,
       u.primary_organization_id,
       o.id AS organization_id,
       o.name AS organization_name,
       o.slug AS organization_slug,
       m.role AS membership_role,
       m.status AS membership_status
     FROM users u
     LEFT JOIN organizations o
       ON o.id = u.primary_organization_id
     LEFT JOIN organization_memberships m
       ON m.organization_id = u.primary_organization_id
      AND m.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  const row = result.rows[0];
  if (!row) return null;

  const membershipRole =
    normalizeOrganizationRole(row.membership_role) ||
    normalizeOrganizationRole(row.legacy_role) ||
    ORGANIZATION_ROLES.STUDENT;

  return {
    userId: Number(row.id),
    nome: row.nome,
    email: row.email,
    systemRole: row.system_role || null,
    accountStatus: row.account_status || "active",
    organization: row.organization_id
      ? {
          id: Number(row.organization_id),
          name: row.organization_name,
          slug: row.organization_slug,
        }
      : null,
    membership: row.organization_id
      ? {
          organization_id: Number(row.organization_id),
          role: membershipRole,
          status: row.membership_status || "active",
        }
      : null,
    effectiveRole: membershipRole,
    legacyRole: row.legacy_role || null,
  };
}

export function toPublicUser(auth) {
  return {
    id: auth.userId,
    nome: auth.nome,
    email: auth.email,
    role: auth.effectiveRole,
    system_role: auth.systemRole,
    organization: auth.organization,
    membership: auth.membership,
    authz: buildAuthSummary(auth),
  };
}
