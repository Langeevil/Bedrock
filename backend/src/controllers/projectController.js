import projectRepository from "../repositories/projectRepository.js";
import {
  canAccessProject,
  canCreateProject,
  canListAllProjects,
  canMutateProject,
} from "../services/resourceAccessService.js";

async function getAuthorizedProject(req, { requireMutation = false } = {}) {
  const project = await projectRepository.findById(
    req.params.id || req.params.projectId,
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

export async function createProject(req, res) {
  try {
    const { name } = req.body;

    if (!canCreateProject(req.auth)) {
      return res.status(403).json({ error: "Sem permissao para criar projetos." });
    }

    const project = await projectRepository.create({
      name,
      user_id: req.userId,
      organization_id: req.auth.organization.id,
    });

    return res.status(201).json({
      message: "Projeto criado com sucesso!",
      project,
    });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return res.status(500).json({ error: "Erro interno ao criar projeto." });
  }
}

export async function getProjectDetails(req, res) {
  try {
    const { project, error } = await getAuthorizedProject(req);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const graphData = project.toGraphData();

    return res.json({
      project,
      graphData,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do projeto:", error);
    return res.status(500).json({ error: "Erro ao processar dados do projeto." });
  }
}

export async function listUserProjects(req, res) {
  try {
    const projects = canListAllProjects(req.auth)
      ? await projectRepository.findByOrganizationId(req.auth.organization.id)
      : await projectRepository.findByUserId(req.userId, req.auth.organization.id);

    return res.json(projects);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    return res.status(500).json({ error: "Erro ao listar projetos." });
  }
}

export async function deleteProject(req, res) {
  try {
    const { project, error } = await getAuthorizedProject(req, { requireMutation: true });
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    await projectRepository.remove(project.id);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover projeto:", error);
    return res.status(500).json({ error: "Erro ao remover projeto." });
  }
}

export default {
  createProject,
  getProjectDetails,
  listUserProjects,
  deleteProject,
};
