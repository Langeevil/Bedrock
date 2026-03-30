import * as service from "../services/disciplineTaskService.js";

// ===== TAREFAS =====

export async function listTasks(req, res) {
  try {
    const { disciplineId } = req.params;
    const tasks = await service.getTasksByDiscipline(disciplineId, req.auth);
    res.json(tasks);
  } catch (err) {
    console.error("Erro ao listar tarefas:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function getTask(req, res) {
  try {
    const { disciplineId, taskId } = req.params;
    const task = await service.getTaskDetails(taskId, disciplineId, req.auth);
    res.json(task);
  } catch (err) {
    console.error("Erro ao buscar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function createTask(req, res) {
  try {
    const { disciplineId } = req.params;
    const task = await service.createTask(disciplineId, req.body, req.auth);
    res.status(201).json(task);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function updateTask(req, res) {
  try {
    const { disciplineId, taskId } = req.params;
    const task = await service.updateTask(taskId, disciplineId, req.body, req.auth);
    res.json(task);
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function deleteTask(req, res) {
  try {
    const { disciplineId, taskId } = req.params;
    await service.deleteTask(taskId, disciplineId, req.auth);
    res.json({ message: "Tarefa deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

// ===== ARQUIVOS DE TAREFAS =====

export async function addTaskFile(req, res) {
  try {
    const { disciplineId, taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
    }

    const file = await service.addTaskFile(
      taskId,
      disciplineId,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.auth
    );

    res.status(201).json(file);
  } catch (err) {
    console.error("Erro ao adicionar arquivo à tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function deleteTaskFile(req, res) {
  try {
    const { disciplineId, taskId, fileId } = req.params;
    await service.deleteTaskFile(fileId, taskId, disciplineId, req.auth);
    res.json({ message: "Arquivo deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar arquivo:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

// ===== SUBMISSÕES DO ALUNO =====

export async function submitTask(req, res) {
  try {
    const { disciplineId, taskId } = req.params;
    const submission = await service.submitTask(taskId, disciplineId, req.auth);
    res.status(201).json(submission);
  } catch (err) {
    console.error("Erro ao enviar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function completeTask(req, res) {
  try {
    const { disciplineId, taskId } = req.params;
    const submission = await service.completeTask(taskId, disciplineId, req.auth);
    res.json(submission);
  } catch (err) {
    console.error("Erro ao finalizar tarefa:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function addSubmissionFile(req, res) {
  try {
    const { disciplineId, taskId, submissionId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
    }

    const file = await service.addSubmissionFile(
      submissionId,
      taskId,
      disciplineId,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.auth
    );

    res.status(201).json(file);
  } catch (err) {
    console.error("Erro ao adicionar arquivo de submissão:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function deleteSubmissionFile(req, res) {
  try {
    const { disciplineId, taskId, submissionId, fileId } = req.params;
    await service.deleteSubmissionFile(fileId, submissionId, taskId, disciplineId, req.auth);
    res.json({ message: "Arquivo deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar arquivo de submissão:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function getSubmission(req, res) {
  try {
    const { disciplineId, submissionId } = req.params;
    const submission = await service.getSubmission(submissionId, disciplineId, req.auth);
    res.json(submission);
  } catch (err) {
    console.error("Erro ao buscar submissão:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export async function gradeSubmission(req, res) {
  try {
    const { disciplineId, taskId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await service.gradeSubmission(submissionId, taskId, disciplineId, grade, feedback, req.auth);
    res.json(submission);
  } catch (err) {
    console.error("Erro ao avaliar submissão:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}
