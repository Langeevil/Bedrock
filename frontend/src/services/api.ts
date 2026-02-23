// src/services/api.ts
const API_URL = "http://localhost:4000/api/auth";

interface User {
  id: number;
  nome: string;
  email: string;
}

interface RegisterResponse {
  message: string;
  user?: User;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user: User;
}

interface ApiError {
  error: string;
}

async function parseApiResponse(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  throw new Error(
    text?.trim()
      ? `Resposta invalida do servidor: ${text.slice(0, 120)}`
      : "Resposta invalida do servidor (nao-JSON)."
  );
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

  const data = await parseApiResponse(res);

  if (!res.ok) {
    throw new Error((data as ApiError).error || "Erro ao cadastrar");
  }

  return {
    message: data.message,
    user: data.usuario,
  };
}

export async function loginUser(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/entrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await parseApiResponse(res);

  if (!res.ok) {
    throw new Error((data as ApiError).error || "Erro ao entrar");
  }

  return {
    message: data.message,
    token: data.token,
    user: data.usuario,
  };
}
