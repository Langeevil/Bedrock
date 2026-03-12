// src/services/disciplinesService.ts
import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
export interface Discipline {
  id: number;
  name: string;
  code: string;
  professor: string;
  created_at?: string;
}
export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface DisciplinesResponse {
  data: Discipline[];
  pagination: Pagination;
}
const API_URL = "http://localhost:4000/api/disciplines";
export async function listDisciplines(page = 1, limit = 12): Promise<DisciplinesResponse> {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(false),
  });
  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar disciplinas");
  return data as DisciplinesResponse;
}
export async function createDiscipline(
  payload: Omit<Discipline, "id" | "created_at">
): Promise<Discipline> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao criar disciplina");
  return data as Discipline;
}
export async function updateDiscipline(
  id: number,
  payload: Omit<Discipline, "id" | "created_at">
): Promise<Discipline> {
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
// fetch a single discipline by its id
export async function getDiscipline(id: number): Promise<Discipline> {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(false),
  });
  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar disciplina");
  return data as Discipline;
}