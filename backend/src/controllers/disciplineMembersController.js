import {
  addDisciplineMember,
  listDisciplineMembers,
} from "../services/disciplineService.js";

export async function listarMembros(req, res) {
  try {
    const members = await listDisciplineMembers(req.params.id, req.auth);
    return res.json(members);
  } catch (err) {
    console.error("Erro ao listar membros da disciplina:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function adicionarMembro(req, res) {
  try {
    const members = await addDisciplineMember(req.params.id, req.body, req.auth);
    return res.status(201).json(members);
  } catch (err) {
    console.error("Erro ao adicionar membro na disciplina:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
  }
}
