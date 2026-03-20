// ── Domain ────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "doing" | "done";

export type TabKey = "graph" | "tasks" | "tags";

export interface Tag {
  id: string;
  project_id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  tags: string[]; // Tag IDs — tag groups this task
}

export interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: number;
}

export interface ProjectStats {
  total: number;
  done: number;
  tagCount: number;
}

export interface StatusMeta {
  label: string;
  bg: string;
  color: string;
}

// ── Graph ─────────────────────────────────────────────────────────────────────
// Tags are GROUP HUBS: Project → Tag → [Tasks with that tag]
// A task with no tags connects directly to the project node.

export interface GraphNode {
  id: string;
  label: string;
  type: "project" | "task" | "tag";
  color: string;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  taskId?: string;
  tagId?: string;
  status?: TaskStatus;
}

export interface GraphEdge {
  s: string;
  t: string;
  rel: "project_to_tag" | "project_to_task" | "task_to_tag";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Camera {
  ox: number;
  oy: number;
  scale: number;
  drag: boolean;
  lx: number;
  ly: number;
}

export interface TooltipData {
  x: number;
  y: number;
  node: GraphNode;
  extra: string[];  // task names for tag nodes, tag names for task nodes
}

// ── UI State ──────────────────────────────────────────────────────────────────

export interface PanelState {
  open: boolean;
  mode: "new" | "edit" | null;
  task: Task | null;
}