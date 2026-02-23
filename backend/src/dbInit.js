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

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_disciplines_user_id ON disciplines(user_id)
    `);
  } catch (err) {
    console.error("Erro ao garantir schema:", err);
    throw err;
  }
}
