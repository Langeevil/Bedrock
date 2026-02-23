import { getAuthHeaders, parseJsonOrThrow } from "./http";

export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  graduationRate: number;
}

const API_URL = "http://localhost:4000/api/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/stats`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar dashboard");

  return {
    totalStudents: Number(data.totalStudents || 0),
    activeCourses: Number(data.activeCourses || 0),
    graduationRate: Number(data.graduationRate || 0),
  };
}
