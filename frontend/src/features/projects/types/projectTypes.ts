// src/features/projects/types/projectTypes.ts

export type TaskStatus = "todo" | "doing" | "done";

export type ProjectTabKey = "overview" | "graph" | "new" | "settings";
export type TabKey = "graph" | "tasks" | "tags";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  tags: string[]; // IDs das tags
}

export interface Project {
  id: string;
  name: string;
  user_id: string | number;
  created_at: string | number;
  tasks: Task[];
  tags: Tag[];
}

export interface CreateProjectDTO {
  name: string;
}

export interface ProjectStats {
  total: number;
  done: number;
  tagCount: number;
}

export interface PanelState {
  open: boolean;
  mode: "new" | "edit" | null;
  task: Task | null;
}

export interface StatusMeta {
  label: string;
  bg: string;
  color: string;
}
