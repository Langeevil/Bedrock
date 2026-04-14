// src/services/api.ts
import { apiUrl } from "./config";

const API_URL = apiUrl("/auth");
// backend routes use Portuguese verbs: /cadastrar and /entrar

interface RegisterResponse {
  message: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

// ✅ Corrigido para bater com o que o backend retorna
export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: string;
    system_role?: string | null;
    organization?: {
      id: number;
      name: string;
      slug: string;
    } | null;
    membership?: {
      organization_id: number;
      role: string;
      status: string;
    } | null;
  };
}

interface ApiError {
  error: string;
}

export async function registerUser(
  nome: string,
  email: string,
  senha: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/cadastrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  const data: RegisterResponse | ApiError = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || "Erro ao cadastrar");
  }

  return data as RegisterResponse;
}

export async function loginUser(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/entrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data: LoginResponse | ApiError = await res.json();

  if (!res.ok) throw new Error((data as ApiError).error || "Erro ao entrar");

  return data as LoginResponse;
}
