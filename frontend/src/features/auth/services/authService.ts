// src/features/auth/services/authService.ts

import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from "../../../shared/services/api";
import type { User, LoginResponse, RegisterResponse } from "../types/authTypes";

const API_URL = "http://localhost:4000/api/auth";

export async function loginUser(email: string, senha: string): Promise<LoginResponse> {
  return apiLoginUser(email, senha);
}

export async function registerUser(nome: string, email: string, senha: string): Promise<RegisterResponse> {
  return apiRegisterUser(nome, email, senha);
}

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
