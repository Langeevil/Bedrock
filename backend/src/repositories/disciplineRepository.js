// repositories/disciplineRepository.js
import pool from "../db.js";

/**
 * Conta o número total de disciplinas no banco de dados
 * @returns {Promise<number>} Total de disciplinas
 */
export async function countDisciplines() {
  const res = await pool.query("SELECT COUNT(*) FROM disciplines");
  return Number.parseInt(res.rows[0].count, 10);
}

/**
 * Busca todas as disciplinas com paginação
 * @param {number} limit - Número máximo de registros a retornar
 * @param {number} offset - Número de registros a pular
 * @returns {Promise<Array>} Array de disciplinas
 */
export async function findAllDisciplines(limit, offset) {
  const res = await pool.query(
    "SELECT * FROM disciplines ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return res.rows;
}

/**
 * Busca uma disciplina pelo ID
 * @param {number} id - ID da disciplina
 * @returns {Promise<Object|null>} Disciplina encontrada ou null
 */
export async function findDisciplineById(id) {
  const res = await pool.query("SELECT * FROM disciplines WHERE id = $1", [id]);
  return res.rows[0] || null;
}

/**
 * Busca uma disciplina pelo código
 * @param {string} code - Código da disciplina
 * @returns {Promise<Object|null>} Disciplina encontrada ou null
 */
export async function findDisciplineByCode(code) {
  const res = await pool.query("SELECT * FROM disciplines WHERE code = $1", [code]);
  return res.rows[0] || null;
}

/**
 * Cria uma nova disciplina
 * @param {Object} disciplineData - Dados da disciplina
 * @param {string} disciplineData.name - Nome da disciplina
 * @param {string} disciplineData.code - Código da disciplina
 * @param {string} disciplineData.professor - Nome do professor
 * @param {number} disciplineData.user_id - ID do usuário criador
 * @returns {Promise<Object>} Disciplina criada
 */
export async function createDiscipline({ name, code, professor, user_id }) {
  const res = await pool.query(
    "INSERT INTO disciplines (name, code, professor, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, code, professor, user_id]
  );
  return res.rows[0];
}

/**
 * Atualiza uma disciplina existente
 * @param {number} id - ID da disciplina
 * @param {Object} disciplineData - Dados a atualizar
 * @param {string} disciplineData.name - Nome da disciplina
 * @param {string} disciplineData.code - Código da disciplina
 * @param {string} disciplineData.professor - Nome do professor
 * @returns {Promise<Object|null>} Disciplina atualizada ou null
 */
export async function updateDiscipline(id, { name, code, professor }) {
  const res = await pool.query(
    "UPDATE disciplines SET name = $1, code = $2, professor = $3 WHERE id = $4 RETURNING *",
    [name, code, professor, id]
  );
  return res.rows[0] || null;
}

/**
 * Deleta uma disciplina
 * @param {number} id - ID da disciplina
 * @returns {Promise<Object|null>} ID da disciplina deletada ou null
 */
export async function deleteDiscipline(id) {
  const res = await pool.query("DELETE FROM disciplines WHERE id = $1 RETURNING id", [id]);
  return res.rows[0] || null;
}

/**
 * Busca disciplinas por ID do usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Array de disciplinas do usuário
 */
export async function findDisciplinesByUserId(userId) {
  const res = await pool.query(
    "SELECT * FROM disciplines WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return res.rows;
}

/**
 * Busca disciplinas por professor
 * @param {string} professor - Nome do professor
 * @returns {Promise<Array>} Array de disciplinas do professor
 */
export async function findDisciplinesByProfessor(professor) {
  const res = await pool.query(
    "SELECT * FROM disciplines WHERE professor = $1 ORDER BY created_at DESC",
    [professor]
  );
  return res.rows;
}

export default {
  countDisciplines,
  findAllDisciplines,
  findDisciplineById,
  findDisciplineByCode,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
  findDisciplinesByUserId,
  findDisciplinesByProfessor,
};
