import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import { apiUrl } from "../../../shared/services/config";
import type { Material } from "../types/disciplineTypes";

const API_URL = apiUrl("/disciplines");

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

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
    `${API_URL}/${disciplineId}/arquivos/upload`,
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

  export async function deleteFile(
  disciplineId: number,
  fileId: number
  ): Promise<void> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/arquivos/${fileId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);

  if (!res.ok) {
    throw new Error(data.error || "Erro ao excluir arquivo");
  }
}

export async function downloadFile(
  disciplineId: number,
  fileId: number,
  originalName: string
): Promise<void> {
  try {
    console.log(`[FRONT] Solicitando download: disciplina ${disciplineId}, arquivo ${fileId}`);
    const res = await fetch(
      `${API_URL}/${disciplineId}/arquivos/${fileId}/download`,
      {
        headers: getAuthHeaders(false),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[FRONT] Erro na resposta do servidor:", res.status, errorData);
      throw new Error(errorData.error || "Erro ao baixar arquivo");
    }

    const blob = await res.blob();
    console.log(`[FRONT] Blob recebido: ${blob.size} bytes, tipo: ${blob.type}`);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    document.body.appendChild(a);
    a.click();

    // Pequeno delay para garantir o clique antes de revogar
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    } catch (err: any) {
    console.error("[FRONT] Erro fatal no downloadFile:", err);
    alert("Falha ao abrir arquivo: " + err.message);
    }
    }

    export async function openFile(
      disciplineId: number,
      fileId: number
    ): Promise<void> {
      try {
        const res = await fetch(
          `${API_URL}/${disciplineId}/arquivos/${fileId}/download?view=true`,
          {
            headers: getAuthHeaders(false),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Erro ao abrir arquivo");
        }

        const blob = await res.blob();
        // Criamos um novo blob garantindo que o tipo MIME seja mantido para o navegador abrir corretamente
        const fileURL = URL.createObjectURL(blob);

        // Abrir em nova aba
        const newWindow = window.open(fileURL, "_blank");
        if (!newWindow) {
          alert("O bloqueador de pop-ups impediu a abertura do arquivo.");
        }
      } catch (err: any) {
        console.error("[FRONT] Erro ao abrir arquivo:", err);
        alert("Falha ao abrir arquivo: " + err.message);
      }
    }
