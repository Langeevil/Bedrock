import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import type { Project, ProjectStatus, CreateProjectDTO } from "../types/projectTypes";

const API_URL = "http://localhost:4000/api/projects";

// Tipos para os dados do Grafo
export interface GraphData {
  nodes: { id: string; label: string; type: string; color?: string }[];
  links: { source: string; target: string; relationship: string }[];
}

export interface ProjectDetailsResponse {
  project: Project;
  graphData: GraphData;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return await parseJsonOrThrow(res);
}

export async function createProject(dto: CreateProjectDTO): Promise<Project> {
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name: dto.title }),
  });
  const data = await parseJsonOrThrow(res);
  return data.project || data;
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return await parseJsonOrThrow(res);
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function getProjectGraph(id: string): Promise<ProjectDetailsResponse> {
  const res = await fetch(`${API_URL}/${id}/graph`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return await parseJsonOrThrow(res);
}
