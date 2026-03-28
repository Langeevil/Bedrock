import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import type { StatisticsData } from "../types/statisticsTypes";

const API_URL = "http://localhost:4000/api/statistics";

export async function getStatistics(): Promise<StatisticsData> {
  const res = await fetch(`${API_URL}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar estatísticas");

  return {
    totalStudents: Number(data.totalStudents || 0),
    activeCourses: Number(data.activeCourses || 0),
    graduationRate: Number(data.graduationRate || 0),
    disciplinesCount: Number(data.disciplinesCount || 0),
  };
}
