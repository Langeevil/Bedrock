import taskRepository from "../repositories/taskRepository.js";
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

export async function listTasks(req, res) {
  try {
    const { error } = await loadProject(req);
    if (error) return res.status(error.status).json({ error: error.message });

    const tasks = await taskRepository.findByProjectId(req.params.projectId);
    return res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    return res.status(500).json({ error: "Erro ao listar tarefas." });
  }
}

export async function createTask(req, res) {
  try {
    const { error } = await loadProject(req, true);
    if (error) return res.status(error.status).json({ error: error.message });

    const { title, status } = req.body;
    const task = await taskRepository.create({
      project_id: req.params.projectId,
      title,
      status,
    });
    return res.status(201).json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500).json({ error: "Erro ao criar tarefa." });
  }
}

export async function updateTask(req, res) {
  try {
    const { error } = await loadProject(req, true);
    if (error) return res.status(error.status).json({ error: error.message });

    const { taskId } = req.params;
    const { title, status, tags } = req.body;
    const task = await taskRepository.update(taskId, { title, status, tags });

    if (!task) return res.status(404).json({ error: "Tarefa nao encontrada." });
    return res.json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return res.status(500).json({ error: "Erro ao atualizar tarefa." });
  }
}

export async function deleteTask(req, res) {
  try {
    const { error } = await loadProject(req, true);
    if (error) return res.status(error.status).json({ error: error.message });

    await taskRepository.remove(req.params.taskId);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return res.status(500).json({ error: "Erro ao deletar tarefa." });
  }
}

export default { listTasks, createTask, updateTask, deleteTask };
