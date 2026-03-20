import pool from "../db.js";
import { Project } from "../models/projectModel.js";

/**
 * Busca um projeto completo com tarefas (incluindo tag_ids) e tags
 */
export async function findById(id) {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.user_id,
      p.created_at,

      -- Tasks com seus tag_ids embutidos
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id',         t.id,
              'project_id', t.project_id,
              'title',      t.title,
              'status',     t.status,
              'tags',       COALESCE(
                              (SELECT json_agg(tt.tag_id ORDER BY tt.tag_id)
                               FROM task_tags tt WHERE tt.task_id = t.id),
                              '[]'::json
                            )
            )
            ORDER BY t.created_at
          )
          FROM tasks t WHERE t.project_id = p.id
        ),
        '[]'
      ) AS tasks,

      -- Tags únicas do projeto (deduplicated)
      COALESCE(
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id',         tg.id,
            'project_id', tg.project_id,
            'name',       tg.name,
            'color',      tg.color
          ))
          FROM tags tg
          WHERE tg.project_id = p.id
        ),
        '[]'
      ) AS tags

    FROM projects p
    WHERE p.id = $1;
  `;

  const res = await pool.query(query, [id]);
  if (res.rows.length === 0) return null;
  return new Project(res.rows[0]);
}

/**
 * Busca todos os projetos de um usuário
 */
export async function findByUserId(userId) {
  const res = await pool.query(
    `SELECT id, name, user_id, created_at
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
    `INSERT INTO projects (name, user_id)
     VALUES ($1, $2)
     RETURNING id, name, user_id, created_at`,
    [name, user_id]
  );
  return new Project(res.rows[0]);
}

export default { findById, findByUserId, create };