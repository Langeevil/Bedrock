// src/features/disciplines/services/filesService.ts
import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import type { Material } from "../types/disciplineTypes";

const API_URL = "http://localhost:4000/api/disciplines";

export interface FileListPage {
  data: Material[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function listFiles(
  disciplineId: number,
  options: { page?: number; limit?: number } = {}
): Promise<FileListPage> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));

  const res = await fetch(`${API_URL}/${disciplineId}/arquivos?${params.toString()}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao listar arquivos");

  return data as FileListPage;
}

export async function uploadFile(
  disciplineId: number,
  file: File
): Promise<Material> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/${disciplineId}/arquivos/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao fazer upload do arquivo");

  return data as Material;
}

export async function deleteFile(disciplineId: number, fileId: number): Promise<void> {
  const res = await fetch(`${API_URL}/${disciplineId}/arquivos/${fileId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao deletar arquivo");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
