import pool from "../db.js";

export async function findByProjectId(projectId) {
  const res = await pool.query(
    `SELECT 
       t.id, t.project_id, t.title, t.status,
       COALESCE(
         (SELECT json_agg(tt.tag_id ORDER BY tt.tag_id)
          FROM task_tags tt WHERE tt.task_id = t.id),
         '[]'
       ) AS tags
     FROM tasks t
     WHERE t.project_id = $1
     ORDER BY t.created_at ASC`,
    [projectId]
  );
  return res.rows;
}

export async function create({ project_id, title, status = "todo" }) {
  const res = await pool.query(
    `INSERT INTO tasks (project_id, title, status)
     VALUES ($1, $2, $3)
     RETURNING id, project_id, title, status`,
    [project_id, title, status]
  );
  return { ...res.rows[0], tags: [] };
}

export async function update(id, { title, status, tags = [] }) {
  // 1. Update task fields
  await pool.query(
    `UPDATE tasks SET title = $1, status = $2 WHERE id = $3`,
    [title, status, id]
  );

  // 2. Remove all existing tag associations for this task
  await pool.query(`DELETE FROM task_tags WHERE task_id = $1`, [id]);

  // 3. Re-insert tag associations — convert to integers to be safe
  if (tags.length > 0) {
    const tagIds = tags.map(t => parseInt(t, 10)).filter(t => !isNaN(t));

    if (tagIds.length > 0) {
      const placeholders = tagIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await pool.query(
        `INSERT INTO task_tags (task_id, tag_id) VALUES ${placeholders}
         ON CONFLICT (task_id, tag_id) DO NOTHING`,
        [id, ...tagIds]
      );
    }
  }

  // 4. Return updated task with refreshed tags
  const res = await pool.query(
    `SELECT 
       t.id, t.project_id, t.title, t.status,
       COALESCE(
         (SELECT json_agg(tt.tag_id ORDER BY tt.tag_id)
          FROM task_tags tt WHERE tt.task_id = t.id),
         '[]'
       ) AS tags
     FROM tasks t WHERE t.id = $1`,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function remove(id) {
  await pool.query(`DELETE FROM task_tags WHERE task_id = $1`, [id]);
  await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
}

export default { findByProjectId, create, update, remove };