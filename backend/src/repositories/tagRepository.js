import pool from "../db.js";

/**
 * Busca todas as tags de um projeto
 */
export async function findByProjectId(projectId) {
  const res = await pool.query(
    `SELECT id, project_id, name, color
     FROM tags
     WHERE project_id = $1
     ORDER BY created_at ASC`,
    [projectId]
  );
  return res.rows;
}

/**
 * Cria uma nova tag
 */
export async function create({ project_id, name, color = "#4a6fa5" }) {
  const res = await pool.query(
    `INSERT INTO tags (project_id, name, color)
     VALUES ($1, $2, $3)
     RETURNING id, project_id, name, color`,
    [project_id, name, color]
  );
  return res.rows[0];
}

/**
 * Remove uma tag e suas associações com tarefas
 */
export async function remove(id) {
  await pool.query(`DELETE FROM task_tags WHERE tag_id = $1`, [id]);
  await pool.query(`DELETE FROM tags WHERE id = $1`, [id]);
}

export default { findByProjectId, create, remove };