import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import { apiUrl } from "../../../shared/services/config";

export type DirectoryScopeOption = "organization" | "external" | "all";

export interface DirectoryEntry {
  id: number;
  nome: string;
  email: string;
  system_role?: string | null;
  effective_role: string;
  organization_role: string;
  membership_status: string;
  account_status: string;
  presence_status: "online" | "offline" | "away";
  scope: "current_organization" | "external_organization";
  organization: {
    id: number;
    name: string;
    slug: string;
    directory_visibility: string;
  };
}

export interface TenancySummary {
  id: number;
  name: string;
  slug: string;
  directory_visibility: string;
  active_members: number;
  domains: Array<{
    id: number;
    domain: string;
    is_primary: boolean;
    created_at: string;
  }>;
  allowed_directory_scopes: DirectoryScopeOption[];
}

const API_URL = apiUrl("/organizations");

export async function getCurrentTenancySummary(): Promise<TenancySummary> {
  const res = await fetch(`${API_URL}/current/tenancy`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar tenancy da organizacao");
  return data as TenancySummary;
}

export async function listDirectoryEntries(input: {
  q?: string;
  scope?: DirectoryScopeOption;
  role?: string;
}): Promise<DirectoryEntry[]> {
  const params = new URLSearchParams();

  if (input.q?.trim()) params.set("q", input.q.trim());
  if (input.scope) params.set("scope", input.scope);
  if (input.role?.trim()) params.set("role", input.role.trim());

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/current/directory${suffix}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar diretorio");
  return Array.isArray(data) ? (data as DirectoryEntry[]) : [];
}
