import {
  ORGANIZATION_ROLES,
  SYSTEM_ROLES,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";

export const id = "001_institution_foundation";
export const description =
  "Adds organizations, memberships, canonical roles, account status and organization scope columns.";

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "organizacao";
}

export async function up(client) {
  // Remove restrições legadas que podem bloquear os novos cargos
  await client.query(`
    ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check
  `);

  await client.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS system_role VARCHAR(30)
  `);

  await client.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active'
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(80) NOT NULL UNIQUE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS organization_memberships (
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (organization_id, user_id)
    )
  `);

  await client.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS primary_organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  await client.query(`
    ALTER TABLE disciplines
    ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  await client.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  await client.query(`
    ALTER TABLE chat_conversations
    ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_users_primary_organization_id
      ON users(primary_organization_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id
      ON organization_memberships(user_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_disciplines_organization_id
      ON disciplines(organization_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_projects_organization_id
      ON projects(organization_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_chat_conversations_organization_id
      ON chat_conversations(organization_id)
  `);

  const orgCountResult = await client.query(
    "SELECT COUNT(*)::int AS count FROM organizations"
  );
  let defaultOrganizationId = 0;

  if (Number(orgCountResult.rows[0]?.count || 0) === 0) {
    const defaultOrg = await client.query(
      `INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING id`,
      ["Bedrock Local", "bedrock-local"]
    );
    defaultOrganizationId = Number(defaultOrg.rows[0].id);
  } else {
    const existing = await client.query(
      "SELECT id FROM organizations ORDER BY id ASC LIMIT 1"
    );
    defaultOrganizationId = Number(existing.rows[0].id);
  }

  const users = await client.query(
    `SELECT id, nome, role, primary_organization_id
     FROM users
     ORDER BY id ASC`
  );

  const firstUserId = Number(users.rows[0]?.id || 0);

  for (const user of users.rows) {
    const normalizedRole =
      normalizeOrganizationRole(user.role) || ORGANIZATION_ROLES.STUDENT;
    const organizationId =
      Number(user.primary_organization_id || 0) || defaultOrganizationId;

    if (!Number(user.primary_organization_id || 0)) {
      await client.query(
        `UPDATE users
         SET primary_organization_id = $2
         WHERE id = $1`,
        [user.id, organizationId]
      );
    }

    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status`,
      [
        organizationId,
        user.id,
        user.id === firstUserId
          ? ORGANIZATION_ROLES.ORGANIZATION_OWNER
          : normalizedRole,
      ]
    );

    const systemRole =
      user.id === firstUserId ? SYSTEM_ROLES.SYSTEM_ADMIN : null;

    await client.query(
      `UPDATE users
       SET role = $2,
           system_role = COALESCE(system_role, $3),
           account_status = COALESCE(account_status, 'active')
       WHERE id = $1`,
      [user.id, normalizedRole, systemRole]
    );
  }

  await client.query(
    `UPDATE organizations o
     SET created_by = COALESCE(o.created_by, $1),
         updated_at = NOW()
     WHERE o.id = $2`,
    [firstUserId || null, defaultOrganizationId]
  );

  await client.query(`
    UPDATE disciplines d
    SET organization_id = u.primary_organization_id
    FROM users u
    WHERE d.organization_id IS NULL
      AND d.user_id = u.id
  `);

  await client.query(`
    UPDATE projects p
    SET organization_id = u.primary_organization_id
    FROM users u
    WHERE p.organization_id IS NULL
      AND p.user_id = u.id
  `);

  await client.query(`
    UPDATE chat_conversations c
    SET organization_id = u.primary_organization_id
    FROM users u
    WHERE c.organization_id IS NULL
      AND c.created_by = u.id
  `);

  const orphanConversations = await client.query(
    `SELECT id, name
     FROM chat_conversations
     WHERE organization_id IS NULL
     ORDER BY id ASC`
  );

  for (const row of orphanConversations.rows) {
    const base = slugify(row.name || `conversation-${row.id}`);
    await client.query(
      `UPDATE chat_conversations
       SET organization_id = $2
       WHERE id = $1`,
      [row.id, defaultOrganizationId]
    );
    void base;
  }
}
