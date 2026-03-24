import {
  ORGANIZATION_ROLES,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";

export const id = "002_discipline_memberships";
export const description =
  "Adds discipline memberships and backfills creators as discipline members.";

export async function up(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS discipline_memberships (
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (discipline_id, user_id)
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_discipline_memberships_user_id
      ON discipline_memberships(user_id)
  `);

  const disciplines = await client.query(`
    SELECT d.id, d.user_id, u.role
    FROM disciplines d
    JOIN users u ON u.id = d.user_id
  `);

  for (const row of disciplines.rows) {
    const role = normalizeOrganizationRole(row.role);
    const membershipRole =
      role && role !== ORGANIZATION_ROLES.STUDENT && role !== ORGANIZATION_ROLES.EXTERNAL_PARTNER
        ? role
        : ORGANIZATION_ROLES.PROFESSOR;

    await client.query(
      `INSERT INTO discipline_memberships (discipline_id, user_id, role, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (discipline_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status`,
      [row.id, row.user_id, membershipRole]
    );
  }
}
