export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

export const SOCKET_BASE_URL = (
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api$/, "")
).replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
