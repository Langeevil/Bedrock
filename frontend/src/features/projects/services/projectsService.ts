import type { Task, Tag, Project } from "../types/projectTypes";
import { INIT_TASKS, INIT_TAGS, PROJECT_ID, PROJECT_NAME } from "../constants/projectConstants";

/**
 * In-memory mock service.
 * Replace the methods below with real API calls (fetch / axios / trpc / etc.)
 * without touching any component or hook — they all consume this service.
 */

// ── Simulated latency helper ─────────────────────────────────────────────────
const delay = (ms = 0) => new Promise<void>(res => setTimeout(res, ms));

// ── In-memory store (replace with actual API) ────────────────────────────────
let _tasks: Task[] = [...INIT_TASKS];
let _tags:  Tag[]  = [...INIT_TAGS];

// ── Project ──────────────────────────────────────────────────────────────────
export async function fetchProject(): Promise<Project> {
  await delay();
  return {
    id:         PROJECT_ID,
    name:       PROJECT_NAME,
    user_id:    "u1",
    created_at: Date.now(),
    tasks:      [..._tasks],
    tags:       [..._tags],
  };
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export async function fetchTasks(): Promise<Task[]> {
  await delay();
  return [..._tasks];
}

export async function createTask(payload: Omit<Task, "id">): Promise<Task> {
  await delay();
  const task: Task = { id: "t" + Date.now(), ...payload };
  _tasks = [..._tasks, task];
  return task;
}

export async function updateTask(updated: Task): Promise<Task> {
  await delay();
  _tasks = _tasks.map(t => (t.id === updated.id ? updated : t));
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  await delay();
  _tasks = _tasks.filter(t => t.id !== id);
}

// ── Tags ─────────────────────────────────────────────────────────────────────
export async function fetchTags(): Promise<Tag[]> {
  await delay();
  return [..._tags];
}

export async function createTag(payload: Omit<Tag, "id">): Promise<Tag> {
  await delay();
  const tag: Tag = { id: "tg" + Date.now(), ...payload };
  _tags = [..._tags, tag];
  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  await delay();
  _tags  = _tags.filter(t => t.id !== id);
  // Cascade: remove deleted tag from all tasks
  _tasks = _tasks.map(t => ({ ...t, tags: t.tags.filter(tid => tid !== id) }));
}