import { useState, useCallback, useEffect } from "react";
import type { Project, Task, Tag, ProjectStats } from "../types/projectTypes";
import * as projectsService from "../services/projectsService";

export interface UseProjectsReturn {
  // Project list
  projects: Project[];
  activeProject: Project | null;
  selectProject: (project: Project) => void;
  createProject: (name: string) => Promise<void>;

  // Active project data
  tasks: Task[];
  tags: Tag[];
  stats: ProjectStats;

  // Tags
  addTag: (payload: Omit<Tag, "id" | "project_id">) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Tasks
  addTask: (payload: Omit<Task, "id" | "project_id">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;

  loading: boolean;
  error: string | null;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects]           = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tasks, setTasks]                 = useState<Task[]>([]);
  const [tags, setTags]                   = useState<Tag[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // ── Load project list on mount ───────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    projectsService
      .fetchProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Load tasks + tags when active project changes ────────────────────────
  useEffect(() => {
    if (!activeProject) {
      setTasks([]);
      setTags([]);
      return;
    }
    setLoading(true);
    Promise.all([
      projectsService.fetchTasks(activeProject.id),
      projectsService.fetchTags(activeProject.id),
    ])
      .then(([t, tg]) => { setTasks(t); setTags(tg); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeProject]);

  // ── Projects ─────────────────────────────────────────────────────────────
  const createProject = useCallback(async (name: string) => {
    const created = await projectsService.createProject(name);
    setProjects((prev: Project[]) => [...prev, created]);
    setActiveProject(created);
  }, []);

  const selectProject = useCallback((project: Project) => {
    setActiveProject(project);
  }, []);

  // ── Tags ─────────────────────────────────────────────────────────────────
  const addTag = useCallback(async (payload: Omit<Tag, "id" | "project_id">) => {
    if (!activeProject) return;
    const created = await projectsService.createTag(activeProject.id, payload);
    setTags((prev: Tag[]) => [...prev, created]);
  }, [activeProject]);

  const deleteTag = useCallback(async (id: string) => {
    if (!activeProject) return;
    await projectsService.deleteTag(activeProject.id, id);
    setTags((prev: Tag[]) => prev.filter((t: Tag) => t.id !== id));
    // Remove deleted tag from all tasks
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => ({ ...t, tags: t.tags.filter((tid: string) => tid !== id) }))
    );
  }, [activeProject]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = useCallback(async (payload: Omit<Task, "id" | "project_id">) => {
    if (!activeProject) return;
    const created = await projectsService.createTask(activeProject.id, payload);
    setTasks((prev: Task[]) => [...prev, created]);
  }, [activeProject]);

  const updateTask = useCallback(async (task: Task) => {
    const updated = await projectsService.updateTask(task);
    setTasks((prev: Task[]) =>
      prev.map((t: Task) => (t.id === updated.id ? updated : t))
    );
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    await projectsService.deleteTask(task);
    setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== task.id));
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats: ProjectStats = {
    total:    tasks.length,
    done:     tasks.filter((t: Task) => t.status === "done").length,
    tagCount: tags.length,
  };

  return {
    projects, activeProject, selectProject, createProject,
    tasks, tags, stats,
    addTag, deleteTag,
    addTask, updateTask, deleteTask,
    loading, error,
  };
}