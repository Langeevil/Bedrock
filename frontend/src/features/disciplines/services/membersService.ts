import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import type { DisciplineMember } from "../types/disciplineTypes";

const API_URL = "http://localhost:4000/api/disciplines";

export async function listMembers(disciplineId: number): Promise<DisciplineMember[]> {
  const res = await fetch(`${API_URL}/${disciplineId}/members`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao listar membros");
  return Array.isArray(data) ? (data as DisciplineMember[]) : [];
}

export async function addMember(
  disciplineId: number,
  input: { userId: number; role?: string }
): Promise<DisciplineMember[]> {
  const res = await fetch(`${API_URL}/${disciplineId}/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao adicionar membro");
  return Array.isArray(data) ? (data as DisciplineMember[]) : [];
}
