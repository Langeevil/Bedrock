import tagRepository from "../repositories/tagRepository.js";
import projectRepository from "../repositories/projectRepository.js";
import { canAccessProject, canMutateProject } from "../services/resourceAccessService.js";

async function loadProject(req, requireMutation = false) {
  const project = await projectRepository.findById(
    req.params.projectId,
    req.auth?.organization?.id || null
  );

  if (!project) {
    return { error: { status: 404, message: "Projeto nao encontrado." } };
  }

  const allowed = requireMutation
    ? canMutateProject(req.auth, project)
    : canAccessProject(req.auth, project);

  if (!allowed) {
    return { error: { status: 403, message: "Sem permissao para acessar este projeto." } };
  }

  return { project };
}

export async function listTags(req, res) {
  try {
    const { error } = await loadProject(req);
    if (error) return res.status(error.status).json({ error: error.message });

    const tags = await tagRepository.findByProjectId(req.params.projectId);
    return res.json(tags);
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    return res.status(500).json({ error: "Erro ao listar tags." });
  }
}

export async function createTag(req, res) {
  try {
    const { error } = await loadProject(req, true);
    if (error) return res.status(error.status).json({ error: error.message });

    const { name, color } = req.body;
    const tag = await tagRepository.create({
      project_id: req.params.projectId,
      name,
      color,
    });
    return res.status(201).json(tag);
  } catch (error) {
    console.error("Erro ao criar tag:", error);
    return res.status(500).json({ error: "Erro ao criar tag." });
  }
}

export async function deleteTag(req, res) {
  try {
    const { error } = await loadProject(req, true);
    if (error) return res.status(error.status).json({ error: error.message });

    await tagRepository.remove(req.params.tagId);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar tag:", error);
    return res.status(500).json({ error: "Erro ao deletar tag." });
  }
}

export default { listTags, createTag, deleteTag };
