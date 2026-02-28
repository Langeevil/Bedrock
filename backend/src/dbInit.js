import pool from "./db.js";

export async function ensureAppSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS disciplines (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(120) NOT NULL,
        code VARCHAR(40) NOT NULL,
        professor VARCHAR(120) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // if the table already existed but lacked user_id (older schema), add it
    await pool.query(`
      ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS user_id INTEGER
    `);

    // create index only if the column exists to avoid errors on legacy DBs
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='disciplines' AND column_name='user_id'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_disciplines_user_id ON disciplines(user_id);
        END IF;
      END $$;
    `);
  } catch (err) {
    console.error("Erro ao garantir schema:", err);
    throw err;
  }
}
