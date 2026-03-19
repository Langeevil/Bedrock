import pool from "../db.js";
import { Project } from "../models/projectModel.js";

/**
 * Busca um projeto completo, agregando tarefas e tags em um único objeto
 */
export async function findById(id) {
  const query = `
    SELECT 
      p.id,
      p.name as title,
      p.user_id,
      p.created_at as "createdAt",
      COALESCE(
        (SELECT json_agg(t.*) FROM tasks t WHERE t.project_id = p.id), 
        '[]'
      ) as tasks,
      COALESCE(
        (SELECT json_agg(tg.*) FROM tags tg 
         JOIN task_tags ttG ON ttG.tag_id = tg.id 
         JOIN tasks t2 ON t2.id = ttG.task_id
         WHERE t2.project_id = p.id), 
        '[]'
      ) as tags
    FROM projects p
    WHERE p.id = $1;
  `;
  
  const res = await pool.query(query, [id]);
  
  if (res.rows.length === 0) return null;
  
  // Retorna uma nova instância da classe Project
  return new Project(res.rows[0]);
}

/**
 * Busca todos os projetos de um usuário
 */
export async function findByUserId(userId) {
  const res = await pool.query(
    `SELECT 
      id, 
      name as title, 
      user_id, 
      created_at as "createdAt" 
     FROM projects 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows.map(row => new Project(row));
}

/**
 * Cria um novo projeto
 */
export async function create({ name, user_id }) {
  const res = await pool.query(
    "INSERT INTO projects (name, user_id) VALUES ($1, $2) RETURNING id, name as title, user_id, created_at as \"createdAt\"",
    [name, user_id]
  );
  return new Project(res.rows[0]);
}

export default {
  findById,
  findByUserId,
  create
};
