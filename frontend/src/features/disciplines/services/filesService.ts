// services/filesService.ts

import type { Material } from "../types/disciplineTypes";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function listFiles(disciplineId: number): Promise<Material[]> {
  const res = await fetch(`${BASE}/disciplines/${disciplineId}/files`);
  if (!res.ok) throw new Error("Erro ao buscar arquivos.");
  return res.json();
}

export async function uploadFile(
  disciplineId: number,
  file: File
): Promise<Material> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/disciplines/${disciplineId}/files`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Erro ao enviar arquivo.");
  return res.json();
}

export async function deleteFile(fileId: number): Promise<void> {
  const res = await fetch(`${BASE}/files/${fileId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir arquivo.");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}