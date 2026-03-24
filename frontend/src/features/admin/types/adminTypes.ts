export interface AdminSummary {
  scope: "system" | "organization";
  total_users: number;
  total_organizations: number;
  active_users: number;
}

export interface AdminUser {
  id: number;
  nome: string;
  email: string;
  role: string;
  system_role?: string | null;
  account_status: string;
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
}

export interface AdminOrganization {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  members_count?: number;
  can_manage: boolean;
}
