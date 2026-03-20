import taskRepository from "../repositories/taskRepository.js";

export async function listTasks(req, res) {
  try {
    const tasks = await taskRepository.findByProjectId(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    res.status(500).json({ error: "Erro ao listar tarefas." });
  }
}

export async function createTask(req, res) {
  try {
    const { title, status } = req.body;
    const task = await taskRepository.create({
      project_id: req.params.projectId,
      title,
      status,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ error: "Erro ao criar tarefa." });
  }
}

export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const { title, status, tags } = req.body;

    console.log(`[updateTask] id=${taskId} title=${title} status=${status} tags=`, tags);

    const task = await taskRepository.update(taskId, { title, status, tags });
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada." });
    res.json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa." });
  }
}

export async function deleteTask(req, res) {
  try {
    await taskRepository.remove(req.params.taskId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).json({ error: "Erro ao deletar tarefa." });
  }
}

export default { listTasks, createTask, updateTask, deleteTask };