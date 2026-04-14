// hooks/useFiles.ts

import { useCallback, useEffect, useState } from "react";
import type { Material } from "../types/disciplineTypes";
import { deleteFile, listFiles, uploadFile } from "../services/filesService";

export function useFiles(disciplineId: number) {
  const [files, setFiles] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listFiles(disciplineId);
      setFiles(data.data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    if (disciplineId) load();
  }, [disciplineId, load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const created = await uploadFile(disciplineId, file);
      setFiles((prev) => [created, ...prev]);
      return created;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (fileId: number) => {
    await deleteFile(disciplineId, fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return { files, loading, uploading, error, reload: load, upload, remove };
}
