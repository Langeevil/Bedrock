import tagRepository from "../repositories/tagRepository.js";

export async function listTags(req, res) {
  try {
    const tags = await tagRepository.findByProjectId(req.params.projectId);
    res.json(tags);
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    res.status(500).json({ error: "Erro ao listar tags." });
  }
}

export async function createTag(req, res) {
  try {
    const { name, color } = req.body;
    const tag = await tagRepository.create({
      project_id: req.params.projectId,
      name,
      color,
    });
    res.status(201).json(tag);
  } catch (error) {
    console.error("Erro ao criar tag:", error);
    res.status(500).json({ error: "Erro ao criar tag." });
  }
}

export async function deleteTag(req, res) {
  try {
    await tagRepository.remove(req.params.tagId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar tag:", error);
    res.status(500).json({ error: "Erro ao deletar tag." });
  }
}

export default { listTags, createTag, deleteTag };