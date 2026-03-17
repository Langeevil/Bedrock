// src/features/projects/hooks/useProjects.ts
import { useState, useEffect, useCallback } from "react";
import type { Project, CreateProjectDTO, ProjectStatus } from "../types/projectTypes";
import * as service from "../services/projectsService";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.listProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProject = async (dto: CreateProjectDTO) => {
    const newProject = await service.createProject(dto);
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateStatus = async (id: string, status: ProjectStatus) => {
    const updated = await service.updateProjectStatus(id, status);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const removeProject = async (id: string) => {
    await service.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, addProject, updateStatus, removeProject, refresh };
};
