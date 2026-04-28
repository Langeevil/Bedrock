export const id = "005_directory_tenancy";
export const description =
  "Adds organization domains and directory visibility controls for multi-institution groundwork.";

export async function up(client) {
  await client.query(`
    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS directory_visibility VARCHAR(30) NOT NULL DEFAULT 'organization'
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS organization_domains (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      domain VARCHAR(160) NOT NULL UNIQUE,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_organization_domains_org_id
      ON organization_domains(organization_id)
  `);

  await client.query(`
    UPDATE organizations
    SET directory_visibility = CASE
      WHEN directory_visibility IN ('organization', 'network', 'public') THEN directory_visibility
      ELSE 'organization'
    END
  `);
}
