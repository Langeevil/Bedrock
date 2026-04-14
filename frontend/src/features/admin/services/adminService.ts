import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import { apiUrl } from "../../../shared/services/config";
import type {
  AdminOrganization,
  AdminSummary,
  AdminUser,
} from "../types/adminTypes";

const API_URL = apiUrl("/admin");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...getAuthHeaders(options?.body ? true : false),
    },
    ...options,
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro administrativo");
  return data as T;
}

export function getAdminSummary() {
  return request<AdminSummary>("/summary");
}

export function listAdminUsers(query = "") {
  const suffix = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
  return request<AdminUser[]>(`/users${suffix}`);
}

export function updateAdminUser(
  userId: number,
  payload: {
    organization_role?: string;
    account_status?: string;
    system_role?: string | null;
  }
) {
  return request<{ message: string; usuario: AdminUser }>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listAdminOrganizations() {
  return request<AdminOrganization[]>("/organizations");
}

export function createAdminOrganization(input: { name: string; slug: string }) {
  return request<AdminOrganization>("/organizations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
