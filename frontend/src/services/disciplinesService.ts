import { getAuthHeaders, parseJsonOrThrow } from "./http";

export interface Discipline {
  id: number;
  name: string;
  code: string;
  professor: string;
  created_at?: string;
}

const API_URL = "http://localhost:4000/api/disciplines";

export async function listDisciplines(): Promise<Discipline[]> {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar disciplinas");

  return Array.isArray(data) ? data : [];
}

export async function createDiscipline(payload: Omit<Discipline, "id" | "created_at">): Promise<Discipline> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao criar disciplina");

  return data as Discipline;
}

export async function updateDiscipline(id: number, payload: Omit<Discipline, "id" | "created_at">): Promise<Discipline> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao atualizar disciplina");

  return data as Discipline;
}

export async function removeDiscipline(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao remover disciplina");
}
