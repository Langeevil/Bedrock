import { useEffect, useState } from "react";
import type { Task, Tag, TaskStatus } from "../../types/projectTypes";
import { STATUS_META } from "../../constants/projectConstants";

export type TaskPanelPayload = Omit<Task, "project_id">;

interface TaskPanelProps {
  open: boolean;
  mode: "new" | "edit" | null;
  task: Task | null;
  tags: Tag[];
  onClose: () => void;
  onSave: (payload: TaskPanelPayload) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

export function TaskPanel({
  open,
  mode,
  task,
  tags,
  onClose,
  onSave,
  onDelete,
}: TaskPanelProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setSelectedTags([...task.tags]);
    } else {
      setTitle("");
      setStatus("todo");
      setSelectedTags([]);
    }
  }, [task, open]);

  const toggleTag = (id: string) =>
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const handleSave = async () => {
    if (!title.trim()) return;

    const payload: TaskPanelPayload = {
      id: task?.id ?? `t${Date.now()}`,
      title: title.trim(),
      status,
      tags: selectedTags,
    };

    await onSave(payload);
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 z-20 w-full max-w-sm border-l border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-5 py-5 shadow-2xl transition-transform sm:px-6 sm:py-6 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar painel da tarefa"
        className="app-icon-button absolute right-4 top-4 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-base transition"
      >
        ×
      </button>

      <div className="mb-6 pr-10 text-base font-semibold text-[var(--app-text)]">
        {mode === "new" ? "Nova tarefa" : "Editar tarefa"}
      </div>

      <label className="block">
        <span className="mb-2.5 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          Título
        </span>
        <input
          aria-label="Nome da tarefa"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          placeholder="Nome da tarefa..."
          className="input input-bordered app-field min-h-[44px] w-full text-base"
        />
      </label>

      <span className="mb-2.5 mt-5 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        Status
      </span>
      <div className="flex flex-wrap gap-2.5">
        {(Object.entries(STATUS_META) as [TaskStatus, (typeof STATUS_META)[TaskStatus]][]).map(
          ([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={`app-btn-surface rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
                status === key
                  ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-contrast)]"
                  : "text-[var(--app-text-muted)]"
              }`}
            >
              {meta.label}
            </button>
          ),
        )}
      </div>

      <span className="mb-2.5 mt-5 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        Tags
      </span>
      {tags.length === 0 && (
        <span className="text-sm text-[var(--app-text-muted)]">Crie tags primeiro</span>
      )}
      <div className="space-y-2.5">
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--app-bg-muted)]"
          >
            <input
              type="checkbox"
              checked={selectedTags.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
              className="checkbox checkbox-sm app-checkbox"
            />
            <span className="h-2 w-2 rounded-full" style={{ background: tag.color }} />
            <span className="text-sm text-[var(--app-text)]">{tag.name}</span>
          </label>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary app-btn-primary min-h-[46px] flex-1 rounded-2xl border-0 px-5"
        >
          Salvar
        </button>
        {mode === "edit" && task && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="btn btn-outline app-btn-outline min-h-[46px] rounded-2xl border-red-300 px-5 text-red-600 hover:border-red-400 hover:bg-red-500/10 hover:text-red-500"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
