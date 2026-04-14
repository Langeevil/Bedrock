import type { Tag, Task, StatusMeta, TaskStatus } from "../types/projectTypes";

export const PROJECT_ID = "p1";
export const PROJECT_NAME = "Redesign do App";

export const TAG_COLORS: string[] = [
  "#4a6fa5",
  "#2d8a5e",
  "#c0563b",
  "#8b5cf6",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#be185d",
];

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  todo: { label: "a fazer", bg: "#f0efe9", color: "#6b6960" },
  doing: { label: "em progresso", bg: "#e8f0fa", color: "#3b5998" },
  done: { label: "concluido", bg: "#e6f5ed", color: "#1e7a45" },
};

export const STATUS_NODE_COLOR: Record<TaskStatus, string> = {
  todo: "#9c9a8e",
  doing: "#4a6fa5",
  done: "#2d8a5e",
};

export const GRAPH_NODE_TYPE_LABEL: Record<"project" | "task" | "tag", string> = {
  project: "Projeto",
  task: "Tarefa",
  tag: "Tag",
};

export const GRAPH_LEGEND: { color: string; label: string }[] = [
  { color: "#1a1a18", label: "Projeto" },
  { color: "#4a6fa5", label: "Tarefa" },
  { color: "#2d8a5e", label: "Tag" },
];

export const TABS = [
  { key: "graph" as const, label: "grafo" },
  { key: "tasks" as const, label: "tarefas" },
  { key: "tags" as const, label: "tags" },
];

export const INIT_TAGS: Tag[] = [
  { id: "tg1", project_id: PROJECT_ID, name: "Design", color: "#4a6fa5" },
  { id: "tg2", project_id: PROJECT_ID, name: "UI", color: "#2d8a5e" },
  { id: "tg3", project_id: PROJECT_ID, name: "Research", color: "#c0563b" },
];

export const INIT_TASKS: Task[] = [
  {
    id: "t1",
    project_id: PROJECT_ID,
    title: "Criar telas de onboarding",
    status: "doing",
    tags: ["tg1", "tg2"],
  },
  {
    id: "t2",
    project_id: PROJECT_ID,
    title: "Revisao de tipografia",
    status: "todo",
    tags: ["tg2"],
  },
  {
    id: "t3",
    project_id: PROJECT_ID,
    title: "Testes de usabilidade",
    status: "done",
    tags: ["tg1", "tg3"],
  },
  {
    id: "t4",
    project_id: PROJECT_ID,
    title: "Exportar assets do Figma",
    status: "done",
    tags: ["tg3"],
  },
  {
    id: "t5",
    project_id: PROJECT_ID,
    title: "Documentar componentes",
    status: "todo",
    tags: [],
  },
];
