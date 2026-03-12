// src/features/auth/types/authTypes.ts

export interface User {
  id: number;
  nome: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface RegisterResponse {
  message: string;
  usuario: User;
}
