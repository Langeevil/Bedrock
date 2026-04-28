import { id as migration001Id, description as migration001Description, up as migration001Up } from "./migrations/001_institution_foundation.js";
import { id as migration002Id, description as migration002Description, up as migration002Up } from "./migrations/002_discipline_memberships.js";
import { id as migration003Id, description as migration003Description, up as migration003Up } from "./migrations/003_discipline_tasks.js";
import { id as migration004Id, description as migration004Description, up as migration004Up } from "./migrations/004_legacy_cleanup.js";
import { id as migration005Id, description as migration005Description, up as migration005Up } from "./migrations/005_directory_tenancy.js";

const migrations = [
  {
    id: migration001Id,
    description: migration001Description,
    up: migration001Up,
  },
  {
    id: migration002Id,
    description: migration002Description,
    up: migration002Up,
  },
  {
    id: migration003Id,
    description: migration003Description,
    up: migration003Up,
  },
  {
    id: migration004Id,
    description: migration004Description,
    up: migration004Up,
  },
  {
    id: migration005Id,
    description: migration005Description,
    up: migration005Up,
  },
];

export async function runMigrations(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(120) PRIMARY KEY,
      description TEXT,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  for (const migration of migrations) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE id = $1",
      [migration.id]
    );

    if (alreadyApplied.rows.length > 0) {
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await migration.up(client);
      await client.query(
        `INSERT INTO schema_migrations (id, description)
         VALUES ($1, $2)`,
        [migration.id, migration.description]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
