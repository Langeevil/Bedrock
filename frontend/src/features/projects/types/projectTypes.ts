// src/features/projects/types/projectTypes.ts

export type ProjectStatus = "planejado" | "em andamento" | "concluido";
 
export type ProjectTabKey = "overview" | "graph" | "new" | "settings";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
}
