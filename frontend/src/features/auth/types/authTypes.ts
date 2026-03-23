// src/features/auth/types/authTypes.ts

export interface User {
  id: number;
  nome: string;
  email: string;
  role?: string;
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
  authz?: {
    user_id: number;
    system_role?: string | null;
    effective_role?: string | null;
    permissions: string[];
  };
}

export interface LoginResponse {
  message?: string;
  token: string;
  usuario: User;
  authz?: User["authz"];
}

export interface RegisterResponse {
  message: string;
  usuario?: User;
}
