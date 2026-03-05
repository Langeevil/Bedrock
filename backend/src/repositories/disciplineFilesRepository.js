// repositories/disciplineFilesRepository.js
import pool from "../db.js";

/**
 * Lista todos os arquivos de uma disciplina
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<Array>} Array de arquivos
 */
export async function findFilesByDisciplineId(disciplineId) {
  const res = await pool.query(
    `SELECT df.*, u.nome as uploaded_by_name 
     FROM discipline_files df
     JOIN users u ON df.uploaded_by = u.id
     WHERE df.discipline_id = $1
     ORDER BY df.created_at DESC`,
    [disciplineId]
  );
  return res.rows;
}

/**
 * Busca um arquivo específico da disciplina
 * @param {number} fileId - ID do arquivo
 * @returns {Promise<Object|null>} Arquivo encontrado ou null
 */
export async function findFileById(fileId) {
  const res = await pool.query(
    `SELECT df.*, u.nome as uploaded_by_name 
     FROM discipline_files df
     JOIN users u ON df.uploaded_by = u.id
     WHERE df.id = $1`,
    [fileId]
  );
  return res.rows[0] || null;
}

/**
 * Conta o número de arquivos de uma disciplina
 * @param {number} disciplineId - ID da disciplina
 * @returns {Promise<number>} Total de arquivos
 */
export async function countFilesByDisciplineId(disciplineId) {
  const res = await pool.query(
    "SELECT COUNT(*) FROM discipline_files WHERE discipline_id = $1",
    [disciplineId]
  );
  return parseInt(res.rows[0].count, 10);
}

/**
 * Busca um arquivo por nome único na disciplina
 * @param {number} disciplineId - ID da disciplina
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<Object|null>} Arquivo encontrado ou null
 */
export async function findFileByName(disciplineId, fileName) {
  const res = await pool.query(
    "SELECT * FROM discipline_files WHERE discipline_id = $1 AND file_name = $2",
    [disciplineId, fileName]
  );
  return res.rows[0] || null;
}

/**
 * Cria um novo arquivo de disciplina
 * @param {Object} fileData - Dados do arquivo
 * @param {number} fileData.discipline_id - ID da disciplina
 * @param {string} fileData.file_name - Nome do arquivo armazenado
 * @param {string} fileData.original_name - Nome original do arquivo
 * @param {string} fileData.storage_key - Chave de armazenamento
 * @param {string} fileData.mime_type - Tipo MIME
 * @param {number} fileData.size_bytes - Tamanho em bytes
 * @param {number} fileData.uploaded_by - ID do usuário que enviou
 * @param {string} fileData.storage_provider - Provedor de armazenamento (padrão: local)
 * @returns {Promise<Object>} Arquivo criado
 */
export async function createFile({
  discipline_id,
  file_name,
  original_name,
  storage_key,
  mime_type,
  size_bytes,
  uploaded_by,
  storage_provider = "local",
}) {
  const res = await pool.query(
    `INSERT INTO discipline_files 
     (discipline_id, file_name, original_name, storage_provider, storage_key, mime_type, size_bytes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [discipline_id, file_name, original_name, storage_provider, storage_key, mime_type, size_bytes, uploaded_by]
  );
  return res.rows[0];
}

/**
 * Deleta um arquivo de disciplina
 * @param {number} fileId - ID do arquivo
 * @returns {Promise<Object|null>} Arquivo deletado ou null
 */
export async function deleteFile(fileId) {
  const res = await pool.query(
    "DELETE FROM discipline_files WHERE id = $1 RETURNING *",
    [fileId]
  );
  return res.rows[0] || null;
}

/**
 * Lista arquivos de uma disciplina com paginação
 * @param {number} disciplineId - ID da disciplina
 * @param {number} limit - Número máximo de registros
 * @param {number} offset - Número de registros a pular
 * @returns {Promise<Array>} Array de arquivos
 */
export async function findFilesByDisciplineIdPaginated(disciplineId, limit, offset) {
  const res = await pool.query(
    `SELECT df.*, u.nome as uploaded_by_name 
     FROM discipline_files df
     JOIN users u ON df.uploaded_by = u.id
     WHERE df.discipline_id = $1
     ORDER BY df.created_at DESC
     LIMIT $2 OFFSET $3`,
    [disciplineId, limit, offset]
  );
  return res.rows;
}

/**
 * Busca arquivos por tipo MIME
 * @param {number} disciplineId - ID da disciplina
 * @param {string} mimeType - Tipo MIME (ex: application/pdf)
 * @returns {Promise<Array>} Array de arquivos
 */
export async function findFilesByMimeType(disciplineId, mimeType) {
  const res = await pool.query(
    `SELECT df.*, u.nome as uploaded_by_name 
     FROM discipline_files df
     JOIN users u ON df.uploaded_by = u.id
     WHERE df.discipline_id = $1 AND df.mime_type = $2
     ORDER BY df.created_at DESC`,
    [disciplineId, mimeType]
  );
  return res.rows;
}

export default {
  findFilesByDisciplineId,
  findFileById,
  countFilesByDisciplineId,
  findFileByName,
  createFile,
  deleteFile,
  findFilesByDisciplineIdPaginated,
  findFilesByMimeType,
};
