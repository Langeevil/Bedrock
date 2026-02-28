// controllers/disciplinesController.js
import pool from "../db.js";

// =====================
// LISTAR DISCIPLINAS COM PAGINAÇÃO (GET)
// =====================
export async function listarDisciplinas(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const [resultado, total] = await Promise.all([
      pool.query(
        "SELECT * FROM disciplines ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      ),
      pool.query("SELECT COUNT(*) FROM disciplines"),
    ]);

    const totalItems = parseInt(total.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: resultado.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Erro ao listar disciplinas:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

// =====================
// BUSCAR UMA DISCIPLINA (GET /:id)
// =====================
export async function buscarDisciplina(req, res) {
  try {
    const { id } = req.params;
    const resultado = await pool.query("SELECT * FROM disciplines WHERE id = $1", [id]);

    if (resultado.rows.length === 0)
      return res.status(404).json({ error: "Disciplina não encontrada." });

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar disciplina:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

// =====================
// CRIAR DISCIPLINA (POST)
// =====================
export async function criarDisciplina(req, res) {
  try {
    const { name, code, professor } = req.body;

    if (!name || !code || !professor)
      return res.status(400).json({ error: "Preencha todos os campos." });

    const existente = await pool.query("SELECT * FROM disciplines WHERE code = $1", [code]);

    if (existente.rows.length > 0)
      return res.status(409).json({ error: "Já existe uma disciplina com esse código." });

    const resultado = await pool.query(
      "INSERT INTO disciplines (name, code, professor) VALUES ($1, $2, $3) RETURNING *",
      [name, code, professor]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error("Erro ao criar disciplina:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

// =====================
// ATUALIZAR DISCIPLINA (PUT /:id)
// =====================
export async function atualizarDisciplina(req, res) {
  try {
    const { id } = req.params;
    const { name, code, professor } = req.body;

    if (!name || !code || !professor)
      return res.status(400).json({ error: "Preencha todos os campos." });

    const resultado = await pool.query(
      "UPDATE disciplines SET name = $1, code = $2, professor = $3 WHERE id = $4 RETURNING *",
      [name, code, professor, id]
    );

    if (resultado.rows.length === 0)
      return res.status(404).json({ error: "Disciplina não encontrada." });

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar disciplina:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

// =====================
// DELETAR DISCIPLINA (DELETE /:id)
// =====================
export async function deletarDisciplina(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM disciplines WHERE id = $1 RETURNING id",
      [id]
    );

    if (resultado.rows.length === 0)
      return res.status(404).json({ error: "Disciplina não encontrada." });

    res.json({ message: "Disciplina deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar disciplina:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}