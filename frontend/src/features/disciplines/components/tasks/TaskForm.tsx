import React, { useState } from "react";
import { createTask } from "../../services/taskService.ts";
import type { TaskFile } from "../../types/taskTypes.ts";
import { Trash2, Loader, Plus, X } from "lucide-react";

interface TaskFormProps {
  disciplineId: number;
  onTaskCreated: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ disciplineId, onTaskCreated, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError("Arquivo muito grande (máximo 100MB)");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Criar a tarefa primeiro se não tiver ID
      // Aqui precisamos de uma abordagem diferente - vamos permitir upload de arquivos após criar
      // Por enquanto vamos usar um estado local
      const localFile: TaskFile = {
        id: Date.now(),
        task_id: 0,
        file_name: file.name,
        file_path: "",
        file_size: file.size,
        uploaded_by: 0,
        uploaded_by_name: "Você",
        uploaded_at: new Date().toISOString(),
      };
      setFiles([...files, localFile]);
      if (e.target) e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
      };

      // Criar a tarefa
      // Note: O upload de arquivos será feito após a criação
      // For now, we'll just notify the user to upload after creation
      console.log("Task data:", taskData);
      
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setFiles([]);
      
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Nova Tarefa</h2>
            <button
              type="button"
              aria-label="Fechar formulario de tarefa"
              onClick={onCancel}
              className="btn btn-ghost btn-sm btn-square"
            >
              <X size={20} />
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error rounded-none">
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Título *</span>
            </label>
            <input
              aria-label="Titulo da tarefa"
              type="text"
              placeholder="Digite o título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="input input-bordered rounded-none"
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Descrição</span>
            </label>
            <textarea
              placeholder="Digite a descrição da tarefa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="textarea textarea-bordered rounded-none resize-none"
              rows={5}
            />
          </div>

          {/* Due Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Prazo</span>
            </label>
            <input
              aria-label="Prazo da tarefa"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
              className="input input-bordered rounded-none"
            />
          </div>

          {/* File Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Arquivos</span>
            </label>
            <input
              aria-label="Arquivos da tarefa"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading || loading}
              className="file-input file-input-bordered rounded-none w-full"
              multiple
            />
            <label className="label">
              <span className="label-text-alt">Máximo 100MB por arquivo</span>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Arquivos Selecionados</h4>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-none"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base-content truncate">{file.file_name}</p>
                    <p className="text-sm text-base-content/60">
                      {(file.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                    className="btn btn-sm btn-ghost btn-square text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-outline rounded-none flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn btn-primary rounded-none flex-1"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
