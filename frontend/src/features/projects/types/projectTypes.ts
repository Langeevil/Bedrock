// src/features/projects/types/projectTypes.ts

export interface Project {
  id: number;
  title: string;
  description: string;
  status: "planejado" | "em andamento" | "concluido";
}
