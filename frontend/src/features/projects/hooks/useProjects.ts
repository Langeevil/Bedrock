import { useState, useCallback } from "react";
import type { Task, Tag, ProjectStats } from "../types/projectTypes";
import * as projectsService from "../services/projectsService";
import { INIT_TASKS, INIT_TAGS } from "../constants/projectConstants";

export interface UseProjectsReturn {
  tasks: Task[];
  tags: Tag[];
  stats: ProjectStats;
  addTag: (payload: Omit<Tag, "id">) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTask: (payload: Omit<Task, "id">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  // Seed local state from the service mock (sync for now, replace with useEffect + fetch)
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);
  const [tags,  setTags]  = useState<Tag[]>(INIT_TAGS);

  // ── Tags ────────────────────────────────────────────────────────────────
  const addTag = useCallback(async (payload: Omit<Tag, "id">) => {
    const created = await projectsService.createTag(payload);
    setTags(prev => [...prev, created]);
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    await projectsService.deleteTag(id);
    setTags(prev  => prev.filter(t => t.id !== id));
    setTasks(prev => prev.map(t => ({ ...t, tags: t.tags.filter(tid => tid !== id) })));
  }, []);

  // ── Tasks ───────────────────────────────────────────────────────────────
  const addTask = useCallback(async (payload: Omit<Task, "id">) => {
    const created = await projectsService.createTask(payload);
    setTasks(prev => [...prev, created]);
  }, []);

  const updateTask = useCallback(async (task: Task) => {
    const updated = await projectsService.updateTask(task);
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await projectsService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats: ProjectStats = {
    total:    tasks.length,
    done:     tasks.filter(t => t.status === "done").length,
    tagCount: tags.length,
  };

  return { tasks, tags, stats, addTag, deleteTag, addTask, updateTask, deleteTask };
}