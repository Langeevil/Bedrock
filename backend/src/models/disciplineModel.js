import pool from "../db.js";

export async function countDisciplines() {
  const res = await pool.query("SELECT COUNT(*) FROM disciplines");
  return Number.parseInt(res.rows[0].count, 10);
}

export async function findAllDisciplines(limit, offset) {
  const res = await pool.query(
    "SELECT * FROM disciplines ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return res.rows;
}

export async function findDisciplineById(id) {
  const res = await pool.query("SELECT * FROM disciplines WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function findDisciplineByCode(code) {
  const res = await pool.query("SELECT * FROM disciplines WHERE code = $1", [code]);
  return res.rows[0] || null;
}

export async function createDiscipline({ name, code, professor, user_id }) {
  const res = await pool.query(
    "INSERT INTO disciplines (name, code, professor, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, code, professor, user_id]
  );
  return res.rows[0];
}

export async function updateDiscipline(id, { name, code, professor }) {
  const res = await pool.query(
    "UPDATE disciplines SET name = $1, code = $2, professor = $3 WHERE id = $4 RETURNING *",
    [name, code, professor, id]
  );
  return res.rows[0] || null;
}

export async function deleteDiscipline(id) {
  const res = await pool.query("DELETE FROM disciplines WHERE id = $1 RETURNING id", [id]);
  return res.rows[0] || null;
}

export default {
  countDisciplines,
  findAllDisciplines,
  findDisciplineById,
  findDisciplineByCode,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
};
