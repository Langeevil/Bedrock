import disciplineTaskRepository from "../repositories/disciplineTaskRepository.js";
import * as disciplineModel from "../models/disciplineModel.js";

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Você não tem permissão para esta ação",
  NOT_FOUND: "Recurso não encontrado",
  INVALID_DATA: "Dados inválidos",
};

// ===== VALIDAÇÕES =====

async function validateUserIsProfessor(userId, disciplineId) {
  const membership = await disciplineModel.findMembershipByDisciplineAndUser(disciplineId, userId);
  if (!membership || membership.role !== "professor") {
    throw {
      status: 403,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    };
  }
}

async function validateUserIsStudentInDiscipline(userId, disciplineId) {
  const membership = await disciplineModel.findMembershipByDisciplineAndUser(disciplineId, userId);
  if (!membership) {
    throw {
      status: 403,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    };
  }
}

async function validateTaskBelongsToDiscipline(taskId, disciplineId) {
  const task = await disciplineTaskRepository.getTaskById(taskId);
  if (!task || task.discipline_id !== disciplineId) {
    throw {
      status: 404,
      message: ERROR_MESSAGES.NOT_FOUND,
    };
  }
  return task;
}

// ===== DISCIPLINE TASKS =====

export async function getTasksByDiscipline(disciplineId, auth) {
  // Valida que o usuário é membro da disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const tasks = await disciplineTaskRepository.getTasksByDiscipline(disciplineId);

  // Para cada tarefa, obter os arquivos e submissão do usuário
  const tasksWithDetails = await Promise.all(
    tasks.map(async (task) => {
      const files = await disciplineTaskRepository.getTaskFiles(task.id);
      const submission = await disciplineTaskRepository.getSubmissionByTaskAndUser(
        task.id,
        auth.userId
      );

      return {
        ...task,
        files,
        userSubmission: submission || null,
      };
    })
  );

  return tasksWithDetails;
}

export async function getTaskDetails(taskId, disciplineId, auth) {
  // Valida que o usuário é membro da disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  const files = await disciplineTaskRepository.getTaskFiles(taskId);
  const submission = await disciplineTaskRepository.getSubmissionByTaskAndUser(
    taskId,
    auth.userId
  );

  let submissions = null;
  const membership = await disciplineModel.findMembershipByDisciplineAndUser(
    disciplineId,
    auth.userId
  );

  // Se o usuário é professor, pode ver todas as submissões
  if (membership && membership.role === "professor") {
    submissions = await disciplineTaskRepository.getSubmissionsByTask(taskId);
    // Para cada submissão, obter os arquivos
    submissions = await Promise.all(
      submissions.map(async (sub) => {
        const subFiles = await disciplineTaskRepository.getSubmissionFiles(sub.id);
        return { ...sub, files: subFiles };
      })
    );
  }

  return {
    ...task,
    files,
    userSubmission: submission || null,
    allSubmissions: submissions,
  };
}

export async function createTask(disciplineId, taskData, auth) {
  // Apenas professor pode criar tarefas
  await validateUserIsProfessor(auth.userId, disciplineId);

  if (!taskData.title || taskData.title.trim() === "") {
    throw {
      status: 400,
      message: "Título é obrigatório",
    };
  }

  const task = await disciplineTaskRepository.createTask(disciplineId, auth.userId, taskData);

  return task;
}

export async function updateTask(taskId, disciplineId, taskData, auth) {
  // Apenas professor pode atualizar tarefas
  await validateUserIsProfessor(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  if (task.created_by !== auth.userId) {
    throw {
      status: 403,
      message: "Apenas o criador da tarefa pode atualizá-la",
    };
  }

  const updated = await disciplineTaskRepository.updateTask(taskId, taskData);

  return updated;
}

export async function deleteTask(taskId, disciplineId, auth) {
  // Apenas professor pode deletar tarefas
  await validateUserIsProfessor(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  if (task.created_by !== auth.userId) {
    throw {
      status: 403,
      message: "Apenas o criador da tarefa pode deletá-la",
    };
  }

  await disciplineTaskRepository.deleteTask(taskId);
}

// ===== TASK FILES =====

export async function addTaskFile(taskId, disciplineId, fileName, filePath, fileSize, auth) {
  // Apenas professor pode adicionar arquivos às tarefas
  await validateUserIsProfessor(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  if (task.created_by !== auth.userId) {
    throw {
      status: 403,
      message: "Apenas o criador da tarefa pode adicionar arquivos",
    };
  }

  const file = await disciplineTaskRepository.addTaskFile(
    taskId,
    fileName,
    filePath,
    fileSize,
    auth.userId
  );

  return file;
}

export async function deleteTaskFile(fileId, taskId, disciplineId, auth) {
  // Apenas professor pode deletar arquivos de tarefas
  await validateUserIsProfessor(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  if (task.created_by !== auth.userId) {
    throw {
      status: 403,
      message: "Apenas o criador da tarefa pode deletar arquivos",
    };
  }

  await disciplineTaskRepository.deleteTaskFile(fileId);
}

// ===== TASK SUBMISSIONS =====

export async function submitTask(taskId, disciplineId, auth) {
  // Valida que o usuário é estudante na disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  let submission = await disciplineTaskRepository.getSubmissionByTaskAndUser(
    taskId,
    auth.userId
  );

  if (!submission) {
    submission = await disciplineTaskRepository.createSubmission(taskId, auth.userId);
  }

  const updated = await disciplineTaskRepository.submitTask(submission.id);

  return updated;
}

export async function completeTask(taskId, disciplineId, auth) {
  // Valida que o usuário é estudante na disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  let submission = await disciplineTaskRepository.getSubmissionByTaskAndUser(
    taskId,
    auth.userId
  );

  if (!submission) {
    submission = await disciplineTaskRepository.createSubmission(taskId, auth.userId);
  }

  const updated = await disciplineTaskRepository.completeTask(submission.id);

  return updated;
}

export async function addSubmissionFile(
  submissionId,
  taskId,
  disciplineId,
  fileName,
  filePath,
  fileSize,
  auth
) {
  // Valida que o usuário é estudante na disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  const submission = await disciplineTaskRepository.getSubmissionById(submissionId);
  if (!submission || submission.task_id !== taskId) {
    throw {
      status: 404,
      message: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  if (submission.user_id !== auth.userId) {
    throw {
      status: 403,
      message: "Você só pode enviar arquivos para sua própria submissão",
    };
  }

  const file = await disciplineTaskRepository.addSubmissionFile(
    submissionId,
    fileName,
    filePath,
    fileSize
  );

  return file;
}

export async function deleteSubmissionFile(fileId, submissionId, taskId, disciplineId, auth) {
  // Valida que o usuário é estudante na disciplina
  await validateUserIsStudentInDiscipline(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  const submission = await disciplineTaskRepository.getSubmissionById(submissionId);
  if (!submission || submission.task_id !== taskId) {
    throw {
      status: 404,
      message: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  if (submission.user_id !== auth.userId) {
    throw {
      status: 403,
      message: "Você só pode deletar arquivos de sua própria submissão",
    };
  }

  await disciplineTaskRepository.deleteSubmissionFile(fileId);
}

// ===== GRADING =====

export async function getSubmission(submissionId, disciplineId, auth) {
  const submission = await disciplineTaskRepository.getSubmissionById(submissionId);
  if (!submission) {
    throw {
      status: 404,
      message: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  const task = await validateTaskBelongsToDiscipline(submission.task_id, disciplineId);
  const membership = await disciplineModel.findMembershipByDisciplineAndUser(
    disciplineId,
    auth.userId
  );

  // Pode ser professor da disciplina ou o próprio aluno
  if (membership.role !== "professor" && submission.user_id !== auth.userId) {
    throw {
      status: 403,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    };
  }

  const files = await disciplineTaskRepository.getSubmissionFiles(submissionId);

  return {
    ...submission,
    files,
  };
}

export async function gradeSubmission(
  submissionId,
  taskId,
  disciplineId,
  grade,
  feedback,
  auth
) {
  // Apenas professor pode avaliar
  await validateUserIsProfessor(auth.userId, disciplineId);

  const task = await validateTaskBelongsToDiscipline(taskId, disciplineId);

  // Valida grade
  if (grade !== null && (isNaN(grade) || grade < 0 || grade > 10)) {
    throw {
      status: 400,
      message: "Nota deve estar entre 0 e 10",
    };
  }

  const submission = await disciplineTaskRepository.getSubmissionById(submissionId);
  if (!submission || submission.task_id !== taskId) {
    throw {
      status: 404,
      message: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  const updated = await disciplineTaskRepository.gradeSubmission(submissionId, grade, feedback);

  return updated;
}
