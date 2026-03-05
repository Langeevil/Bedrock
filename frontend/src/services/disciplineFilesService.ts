// frontend/src/services/disciplineFilesService.ts
import { getAuthHeaders, parseJsonOrThrow } from "./http";

const API_URL = "http://localhost:4000/api/disciplines";

export interface DisciplineFile {
  id: number;
  discipline_id: number;
  file_name: string;
  original_name: string;
  storage_provider: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
}

export interface FileListPage {
  data: DisciplineFile[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Lista os arquivos de uma disciplina com paginação
 */
export async function getDisciplineFiles(
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

/**
 * Busca um arquivo específico
 */
export async function getDisciplineFile(disciplineId: number, fileId: number): Promise<DisciplineFile> {
  const res = await fetch(`${API_URL}/${disciplineId}/arquivos/${fileId}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao buscar arquivo");

  return data as DisciplineFile;
}

/**
 * Cria um novo arquivo (para uso manual, não upload direto)
 */
export async function createDisciplineFile(
  disciplineId: number,
  fileData: {
    file_name: string;
    original_name: string;
    storage_key: string;
    mime_type: string;
    size_bytes: number;
  }
): Promise<DisciplineFile> {
  const res = await fetch(`${API_URL}/${disciplineId}/arquivos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(fileData),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao criar arquivo");

  return data as DisciplineFile;
}

/**
 * Faz upload de um arquivo (TODO: implementar multer no backend)
 */
export async function uploadDisciplineFile(
  disciplineId: number,
  file: File
): Promise<DisciplineFile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/${disciplineId}/arquivos/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao fazer upload do arquivo");

  return data as DisciplineFile;
}

/**
 * Deleta um arquivo
 */
export async function deleteDisciplineFile(disciplineId: number, fileId: number): Promise<void> {
  const res = await fetch(`${API_URL}/${disciplineId}/arquivos/${fileId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao deletar arquivo");
}

/**
 * Formata o tamanho do arquivo para unidades legíveis
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Retorna a cor baseada no tipo de arquivo
 */
export function getFileTypeColor(mimeType: string): string {
  if (mimeType.includes("pdf")) return "#D13438";
  if (mimeType.includes("word")) return "#0078D4";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "#217346";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "#D83B01";
  if (mimeType.includes("image")) return "#7FBA00";
  if (mimeType.includes("audio")) return "#0078D4";
  if (mimeType.includes("video")) return "#D83B01";
  if (mimeType.includes("archive") || mimeType.includes("zip")) return "#605E5C";
  return "#595959";
}

/**
 * Retorna a extensão do arquivo a partir do MIME type
 */
export function getFileExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "text/plain": "TXT",
    "text/csv": "CSV",
  };

  return mimeMap[mimeType] || "FILE";
}

export default {
  getDisciplineFiles,
  getDisciplineFile,
  createDisciplineFile,
  uploadDisciplineFile,
  deleteDisciplineFile,
  formatFileSize,
  getFileTypeColor,
  getFileExtension,
};
