import * as service from "../services/disciplineService.js";

export async function listarDisciplinas(req, res) {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const resultado = await service.listDisciplines(page, limit, req.auth);
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao listar disciplinas:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function buscarDisciplina(req, res) {
  try {
    const { id } = req.params;
    const disciplina = await service.getDiscipline(id, req.auth);
    res.json(disciplina);
  } catch (err) {
    console.error("Erro ao buscar disciplina:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function criarDisciplina(req, res) {
  try {
    const created = await service.createDiscipline(req.body, req.auth);
    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar disciplina:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function atualizarDisciplina(req, res) {
  try {
    const { id } = req.params;
    const updated = await service.updateDiscipline(id, req.body, req.auth);
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar disciplina:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function deletarDisciplina(req, res) {
  try {
    const { id } = req.params;
    await service.removeDiscipline(id, req.auth);
    res.json({ message: "Disciplina deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar disciplina:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}
