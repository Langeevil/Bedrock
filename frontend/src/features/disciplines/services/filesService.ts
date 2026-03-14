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

  const res = await fetch(
    `${API_URL}/${disciplineId}/arquivos?${params.toString()}`,
    {
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);

  if (!res.ok) {
    throw new Error(data.error || "Erro ao listar arquivos");
  }

  return data as FileListPage;
}

export async function uploadFile(
  disciplineId: number,
  file: File
): Promise<Material> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("auth_token");

  const res = await fetch(
    `http://localhost:4000/api/disciplines/${disciplineId}/arquivos/upload`,
    {
      method: "POST",
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
      body: formData,
    }
  );

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Servidor não retornou JSON válido.");
  }

  if (!res.ok) {
    throw new Error(data.error || "Erro ao fazer upload do arquivo");
  }

  return data as Material;
}