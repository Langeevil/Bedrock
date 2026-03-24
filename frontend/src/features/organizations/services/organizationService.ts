import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";

export interface OrganizationMember {
  id: number;
  nome: string;
  email: string;
  system_role?: string | null;
  effective_role: string;
  organization_role: string;
  account_status: string;
  membership_status: string;
  joined_at: string;
}

const API_URL = "http://localhost:4000/api/organizations";

export async function listCurrentOrganizationMembers(): Promise<OrganizationMember[]> {
  const res = await fetch(`${API_URL}/current/members`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao listar membros da instituicao");
  return Array.isArray(data) ? (data as OrganizationMember[]) : [];
}

export async function addCurrentOrganizationMember(input: {
  email: string;
  role?: string;
}): Promise<{ message: string; usuario: OrganizationMember }> {
  const res = await fetch(`${API_URL}/current/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao adicionar membro");
  return data as { message: string; usuario: OrganizationMember };
}

export async function updateCurrentOrganizationMemberRole(
  userId: number,
  role: string
): Promise<{ message: string; usuario: OrganizationMember }> {
  const res = await fetch(`${API_URL}/current/members/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao atualizar papel");
  return data as { message: string; usuario: OrganizationMember };
}
