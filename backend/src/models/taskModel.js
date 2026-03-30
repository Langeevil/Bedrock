import pool from "../db.js";

// ===== DISCIPLINE TASKS =====

export async function findTasksByDiscipline(disciplineId) {
  const result = await pool.query(
    `SELECT 
       dt.*,
       u.nome as created_by_name,
       u.email as created_by_email,
       COUNT(DISTINCT ts.id) as submission_count
     FROM discipline_tasks dt
     LEFT JOIN users u ON u.id = dt.created_by
     LEFT JOIN task_submissions ts ON ts.task_id = dt.id
     WHERE dt.discipline_id = $1
     GROUP BY dt.id, u.nome, u.email
     ORDER BY dt.due_date ASC, dt.created_at DESC`,
    [disciplineId]
  );
  return result.rows;
}

export async function findTaskById(taskId) {
  const result = await pool.query(
    `SELECT 
       dt.*,
       u.nome as created_by_name,
       u.email as created_by_email
     FROM discipline_tasks dt
     LEFT JOIN users u ON u.id = dt.created_by
     WHERE dt.id = $1`,
    [taskId]
  );
  return result.rows[0];
}

export async function createTask(disciplineId, createdBy, title, description, dueDate) {
  const result = await pool.query(
    `INSERT INTO discipline_tasks (discipline_id, created_by, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [disciplineId, createdBy, title, description, dueDate]
  );
  return result.rows[0];
}

export async function updateTask(taskId, title, description, dueDate, status) {
  const result = await pool.query(
    `UPDATE discipline_tasks 
     SET title = $1, description = $2, due_date = $3, status = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, description, dueDate, status, taskId]
  );
  return result.rows[0];
}

export async function deleteTask(taskId) {
  await pool.query("DELETE FROM discipline_tasks WHERE id = $1", [taskId]);
}

// ===== TASK FILES =====

export async function addTaskFile(taskId, fileName, filePath, fileSize, uploadedBy) {
  const result = await pool.query(
    `INSERT INTO task_files (task_id, file_name, file_path, file_size, uploaded_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [taskId, fileName, filePath, fileSize, uploadedBy]
  );
  return result.rows[0];
}

export async function getTaskFiles(taskId) {
  const result = await pool.query(
    `SELECT tf.*, u.nome as uploaded_by_name
     FROM task_files tf
     LEFT JOIN users u ON u.id = tf.uploaded_by
     WHERE tf.task_id = $1
     ORDER BY tf.uploaded_at DESC`,
    [taskId]
  );
  return result.rows;
}

export async function deleteTaskFile(fileId) {
  await pool.query("DELETE FROM task_files WHERE id = $1", [fileId]);
}

// ===== TASK SUBMISSIONS =====

export async function findSubmissionsByTask(taskId) {
  const result = await pool.query(
    `SELECT 
       ts.*,
       u.nome as user_name,
       u.email as user_email
     FROM task_submissions ts
     LEFT JOIN users u ON u.id = ts.user_id
     WHERE ts.task_id = $1
     ORDER BY ts.submitted_at DESC`,
    [taskId]
  );
  return result.rows;
}

export async function findSubmissionByTaskAndUser(taskId, userId) {
  const result = await pool.query(
    `SELECT * FROM task_submissions
     WHERE task_id = $1 AND user_id = $2`,
    [taskId, userId]
  );
  return result.rows[0];
}

export async function findSubmissionById(submissionId) {
  const result = await pool.query(
    `SELECT 
       ts.*,
       u.nome as user_name,
       u.email as user_email
     FROM task_submissions ts
     LEFT JOIN users u ON u.id = ts.user_id
     WHERE ts.id = $1`,
    [submissionId]
  );
  return result.rows[0];
}

export async function createSubmission(taskId, userId) {
  const result = await pool.query(
    `INSERT INTO task_submissions (task_id, user_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (task_id, user_id) DO UPDATE
     SET updated_at = NOW()
     RETURNING *`,
    [taskId, userId]
  );
  return result.rows[0];
}

export async function submitTask(submissionId) {
  const result = await pool.query(
    `UPDATE task_submissions
     SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [submissionId]
  );
  return result.rows[0];
}

export async function completeTask(submissionId) {
  const result = await pool.query(
    `UPDATE task_submissions
     SET status = 'completed', completed_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [submissionId]
  );
  return result.rows[0];
}

export async function gradeSubmission(submissionId, grade, feedback) {
  const result = await pool.query(
    `UPDATE task_submissions
     SET grade = $1, feedback = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [grade, feedback, submissionId]
  );
  return result.rows[0];
}

// ===== SUBMISSION FILES =====

export async function addSubmissionFile(submissionId, fileName, filePath, fileSize) {
  const result = await pool.query(
    `INSERT INTO submission_files (submission_id, file_name, file_path, file_size)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [submissionId, fileName, filePath, fileSize]
  );
  return result.rows[0];
}

export async function getSubmissionFiles(submissionId) {
  const result = await pool.query(
    `SELECT * FROM submission_files
     WHERE submission_id = $1
     ORDER BY uploaded_at DESC`,
    [submissionId]
  );
  return result.rows;
}

export async function deleteSubmissionFile(fileId) {
  await pool.query("DELETE FROM submission_files WHERE id = $1", [fileId]);
}
