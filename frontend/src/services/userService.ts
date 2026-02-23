// src/services/userService.ts
import { getAuthHeaders, parseJsonOrThrow } from "./http";

export interface User {
  id: number;
  nome: string;
  email: string;
  role?: string;
}

const API_URL = "http://localhost:4000/api/auth";

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_URL}/eu`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao buscar usuario");

  return data as User;
}

export async function completeProfile(role: string): Promise<void> {
  const res = await fetch(`${API_URL}/atualizar-perfil`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil");
}
