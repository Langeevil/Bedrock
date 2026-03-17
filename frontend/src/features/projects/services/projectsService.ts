// src/features/projects/services/projectsService.ts
import type { Project, CreateProjectDTO, ProjectStatus } from "../types/projectTypes";

const STORAGE_KEY = "bedrock_projects";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const setStoredProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const listProjects = async (): Promise<Project[]> => {
  await delay(300); // Simulate network
  return getStoredProjects();
};

export const createProject = async (dto: CreateProjectDTO): Promise<Project> => {
  await delay(500);
  const projects = getStoredProjects();
  const newProject: Project = {
    id: crypto.randomUUID(),
    title: dto.title,
    description: dto.description || "",
    status: "planejado",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setStoredProjects([newProject, ...projects]);
  return newProject;
};

export const updateProjectStatus = async (id: string, status: ProjectStatus): Promise<Project> => {
  await delay(300);
  const projects = getStoredProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Project not found");
  
  projects[index] = { ...projects[index], status, updatedAt: new Date().toISOString() };
  setStoredProjects(projects);
  return projects[index];
};

export const deleteProject = async (id: string): Promise<void> => {
  await delay(300);
  const projects = getStoredProjects();
  setStoredProjects(projects.filter((p) => p.id !== id));
};
