export function getAuthToken(): string {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Sessao expirada. Faca login novamente.");
  return token;
}

export function getAuthHeaders(contentType = true): HeadersInit {
  const headers: HeadersInit = {
    Authorization: `Bearer ${getAuthToken()}`,
  };

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export async function parseJsonOrThrow(res: Response) {
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (!text) return {};

  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  throw new Error("Resposta invalida do servidor.");
}
