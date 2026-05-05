import type { DisciplineTask, CreateTaskRequest, GradeSubmissionRequest, TaskFile } from "../types/taskTypes.ts";
import { apiUrl } from "../../../shared/services/config";

const API_URL = apiUrl("/disciplines");

// ===== TAREFAS =====

export async function getTasks(disciplineId: number): Promise<DisciplineTask[]> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar tarefas");
  }

  return response.json();
}

export async function getTaskDetails(disciplineId: number, taskId: number): Promise<DisciplineTask> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar tarefa");
  }

  return response.json();
}

export async function createTask(
  disciplineId: number,
  data: CreateTaskRequest
): Promise<DisciplineTask> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar tarefa");
  }

  return response.json();
}

export async function updateTask(
  disciplineId: number,
  taskId: number,
  data: Partial<CreateTaskRequest>
): Promise<DisciplineTask> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar tarefa");
  }

  return response.json();
}

export async function deleteTask(disciplineId: number, taskId: number): Promise<void> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar tarefa");
  }
}

// ===== ARQUIVOS DE TAREFAS =====

export async function uploadTaskFile(
  disciplineId: number,
  taskId: number,
  file: File
): Promise<TaskFile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}/files`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao fazer upload do arquivo");
  }

  return response.json();
}

export async function deleteTaskFile(
  disciplineId: number,
  taskId: number,
  fileId: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}/files/${fileId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar arquivo");
  }
}

// ===== SUBMISSÕES =====

export async function submitTask(disciplineId: number, taskId: number): Promise<any> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}/submit`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar tarefa");
  }

  return response.json();
}

export async function completeTask(disciplineId: number, taskId: number): Promise<any> {
  const response = await fetch(`${API_URL}/${disciplineId}/tasks/${taskId}/complete`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao finalizar tarefa");
  }

  return response.json();
}

// ===== ARQUIVOS DE SUBMISSÃO =====

export async function uploadSubmissionFile(
  disciplineId: number,
  taskId: number,
  submissionId: number,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/${disciplineId}/tasks/${taskId}/submissions/${submissionId}/files`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao fazer upload do arquivo de submissão");
  }

  return response.json();
}

export async function deleteSubmissionFile(
  disciplineId: number,
  taskId: number,
  submissionId: number,
  fileId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${disciplineId}/tasks/${taskId}/submissions/${submissionId}/files/${fileId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar arquivo de submissão");
  }
}

export async function getSubmission(disciplineId: number, submissionId: number): Promise<any> {
  const response = await fetch(`${API_URL}/${disciplineId}/submissions/${submissionId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar submissão");
  }

  return response.json();
}

export async function gradeSubmission(
  disciplineId: number,
  taskId: number,
  submissionId: number,
  data: GradeSubmissionRequest
): Promise<any> {
  const response = await fetch(
    `${API_URL}/${disciplineId}/tasks/${taskId}/submissions/${submissionId}/grade`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao avaliar submissão");
  }

  return response.json();
}
