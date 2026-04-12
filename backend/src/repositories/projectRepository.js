import pool from "../db.js";
import { Project } from "../models/projectModel.js";

export async function findById(id, organizationId = null) {
  const query = `
    SELECT
      p.id,
      p.name,
      p.user_id,
      p.organization_id,
      p.created_at,
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
    WHERE p.id = $1
      AND ($2::int IS NULL OR p.organization_id = $2);
  `;

  const res = await pool.query(query, [id, organizationId]);
  if (res.rows.length === 0) return null;
  return new Project(res.rows[0]);
}

export async function findByUserId(userId, organizationId = null) {
  const res = await pool.query(
    `SELECT id, name, user_id, organization_id, created_at
     FROM projects
     WHERE user_id = $1
       AND ($2::int IS NULL OR organization_id = $2)
     ORDER BY created_at DESC`,
    [userId, organizationId]
  );
  return res.rows.map((row) => new Project(row));
}

export async function findByOrganizationId(organizationId) {
  const res = await pool.query(
    `SELECT id, name, user_id, organization_id, created_at
     FROM projects
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [organizationId]
  );
  return res.rows.map((row) => new Project(row));
}

export async function create({ name, user_id, organization_id }) {
  const res = await pool.query(
    `INSERT INTO projects (name, user_id, organization_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, user_id, organization_id, created_at`,
    [name, user_id, organization_id]
  );
  return new Project(res.rows[0]);
}

export async function remove(id, organizationId) {
  const res = await pool.query(
    `DELETE FROM projects
     WHERE id = $1
       AND organization_id = $2
     RETURNING id`,
    [id, organizationId]
  );
  return res.rows[0] || null;
}

export default { findById, findByUserId, findByOrganizationId, create, remove };
