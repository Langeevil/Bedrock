import pool from "../db.js";

function parseDisciplinePayload(body) {
  const name = String(body?.name || "").trim();
  const code = String(body?.code || "").trim();
  const professor = String(body?.professor || "").trim();
  return { name, code, professor };
}

export async function listDisciplines(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, code, professor, created_at FROM disciplines WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar disciplinas:", err);
    return res.status(500).json({ error: "Erro ao listar disciplinas." });
  }
}

export async function createDiscipline(req, res) {
  try {
    const { name, code, professor } = parseDisciplinePayload(req.body);

    if (!name || !code || !professor) {
      return res.status(400).json({ error: "Preencha nome, codigo e professor." });
    }

    const result = await pool.query(
      "INSERT INTO disciplines (user_id, name, code, professor) VALUES ($1, $2, $3, $4) RETURNING id, name, code, professor, created_at",
      [req.userId, name, code, professor]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar disciplina:", err);
    return res.status(500).json({ error: "Erro ao criar disciplina." });
  }
}

export async function updateDiscipline(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID invalido." });
    }

    const { name, code, professor } = parseDisciplinePayload(req.body);

    if (!name || !code || !professor) {
      return res.status(400).json({ error: "Preencha nome, codigo e professor." });
    }

    const result = await pool.query(
      `UPDATE disciplines
       SET name = $1, code = $2, professor = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, code, professor, created_at`,
      [name, code, professor, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disciplina nao encontrada." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar disciplina:", err);
    return res.status(500).json({ error: "Erro ao atualizar disciplina." });
  }
}

export async function deleteDiscipline(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID invalido." });
    }

    const result = await pool.query(
      "DELETE FROM disciplines WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disciplina nao encontrada." });
    }

    return res.json({ message: "Disciplina removida com sucesso." });
  } catch (err) {
    console.error("Erro ao remover disciplina:", err);
    return res.status(500).json({ error: "Erro ao remover disciplina." });
  }
}
