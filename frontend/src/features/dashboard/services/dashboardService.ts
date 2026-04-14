// src/features/dashboard/services/dashboardService.ts

import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import { apiUrl } from "../../../shared/services/config";
import type { DashboardStats } from "../types/dashboardTypes";

const API_URL = apiUrl("/dashboard");

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
