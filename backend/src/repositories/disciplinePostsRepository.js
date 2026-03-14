// repositories/disciplinePostsRepository.js
import pool from "../db.js";

/**
 * Lista todos os posts de uma disciplina
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<Array>} Array de posts
 */
export async function findPostsByDisciplineId(disciplineId) {
  const res = await pool.query(
    `SELECT dp.*, u.nome as author_name, u.email as author_email,
            df.original_name as file_name, df.mime_type as file_type, df.size_bytes as file_size
     FROM discipline_posts dp
     JOIN users u ON dp.author_id = u.id
     LEFT JOIN discipline_files df ON dp.file_id = df.id
     WHERE dp.discipline_id = $1 AND dp.deleted_at IS NULL
     ORDER BY dp.pinned DESC, dp.created_at DESC`,
    [disciplineId]
  );
  return res.rows;
}

/**
 * Busca um post específico
 * @param {number} postId - ID do post
 * @returns {Promise<Object|null>} Post encontrado ou null
 */
export async function findPostById(postId) {
  const res = await pool.query(
    `SELECT dp.*, u.nome as author_name, u.email as author_email,
            df.original_name as file_name, df.mime_type as file_type, df.size_bytes as file_size
     FROM discipline_posts dp
     JOIN users u ON dp.author_id = u.id
     LEFT JOIN discipline_files df ON dp.file_id = df.id
     WHERE dp.id = $1 AND dp.deleted_at IS NULL`,
    [postId]
  );
  return res.rows[0] || null;
}

/**
 * Conta o número de posts de uma disciplina
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<number>} Total de posts
 */
export async function countPostsByDisciplineId(disciplineId) {
  const res = await pool.query(
    "SELECT COUNT(*) FROM discipline_posts WHERE discipline_id = $1 AND deleted_at IS NULL",
    [disciplineId]
  );
  return parseInt(res.rows[0].count, 10);
}

/**
 * Cria um novo post
 * @param {Object} postData - Dados do post
 * @param {number} postData.discipline_id - ID da disciplina
 * @param {number} postData.author_id - ID do autor
 * @param {string} postData.content - Conteúdo do post
 * @param {boolean} postData.pinned - Se deve estar fixado
 * @returns {Promise<Object>} Post criado
 */
export async function createPost({
  discipline_id,
  author_id,
  content,
  pinned = false,
  file_id = null,
}) {
  const res = await pool.query(
    `INSERT INTO discipline_posts 
     (discipline_id, author_id, content, pinned, file_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [discipline_id, author_id, content, pinned, file_id]
  );
  return res.rows[0];
}

/**
 * Atualiza um post
 * @param {number} postId - ID do post
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object|null>} Post atualizado ou null
 */
export async function updatePost(postId, { content, pinned }) {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (content !== undefined) {
    updates.push(`content = $${paramCount}`);
    values.push(content);
    paramCount++;
  }

  if (pinned !== undefined) {
    updates.push(`pinned = $${paramCount}`);
    values.push(pinned);
    paramCount++;
  }

  if (updates.length === 0) return null;

  updates.push(`updated_at = NOW()`);
  values.push(postId);

  const res = await pool.query(
    `UPDATE discipline_posts 
     SET ${updates.join(", ")}
     WHERE id = $${paramCount} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  return res.rows[0] || null;
}

/**
 * Deleta (soft delete) um post
 * @param {number} postId - ID do post
 * @returns {Promise<Object|null>} Post deletado ou null
 */
export async function deletePost(postId) {
  const res = await pool.query(
    `UPDATE discipline_posts 
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [postId]
  );
  return res.rows[0] || null;
}

/**
 * Lista posts com paginação
 * @param {number} disciplineId - ID da disciplina
 * @param {number} limit - Número máximo de registros
 * @param {number} offset - Número de registros a pular
 * @returns {Promise<Array>} Array de posts
 */
export async function findPostsByDisciplineIdPaginated(disciplineId, limit, offset) {
  const res = await pool.query(
    `SELECT dp.*, u.nome as author_name, u.email as author_email,
            df.original_name as file_name, df.mime_type as file_type, df.size_bytes as file_size
     FROM discipline_posts dp
     JOIN users u ON dp.author_id = u.id
     LEFT JOIN discipline_files df ON dp.file_id = df.id
     WHERE dp.discipline_id = $1 AND dp.deleted_at IS NULL
     ORDER BY dp.pinned DESC, dp.created_at DESC
     LIMIT $2 OFFSET $3`,
    [disciplineId, limit, offset]
  );
  return res.rows;
}

export default {
  findPostsByDisciplineId,
  findPostById,
  countPostsByDisciplineId,
  createPost,
  updatePost,
  deletePost,
  findPostsByDisciplineIdPaginated,
};
