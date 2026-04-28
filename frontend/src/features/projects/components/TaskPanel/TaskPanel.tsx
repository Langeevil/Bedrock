import { useState, useEffect } from "react";
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
  const [selTags, setSelTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setSelTags([...task.tags]);
    } else {
      setTitle("");
      setStatus("todo");
      setSelTags([]);
    }
  }, [task, open]);

  const toggleTag = (id: string) =>
    setSelTags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const handleSave = async () => {
    if (!title.trim()) return;
    const payload: TaskPanelPayload = {
      id: task?.id ?? `t${Date.now()}`,
      title: title.trim(),
      status,
      tags: selTags,
    };
    await onSave(payload);
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 z-20 w-full max-w-sm border-l border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-4 shadow-2xl transition-transform sm:p-5 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-base text-[var(--app-text-muted)] transition hover:bg-[var(--app-bg-muted)] hover:text-[var(--app-text)]"
      >
        ✕
      </button>

      <div className="mb-5 pr-10 text-base font-semibold text-[var(--app-text)]">
        {mode === "new" ? "Nova Tarefa" : "Editar Tarefa"}
      </div>

      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          Titulo
        </span>
        <input
          aria-label="Nome da tarefa"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          placeholder="Nome da tarefa..."
          className="input input-bordered app-input min-h-[44px] w-full text-base"
        />
      </label>

      <span className="mb-2 mt-4 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        Status
      </span>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(STATUS_META) as [TaskStatus, (typeof STATUS_META)[TaskStatus]][]).map(
          ([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                status === key
                  ? "border-[var(--app-text)] bg-[var(--app-text)] text-[var(--app-bg)]"
                  : "border-[var(--app-border)] bg-[var(--app-bg-elevated)] text-[var(--app-text-muted)]"
              }`}
            >
              {meta.label}
            </button>
          )
        )}
      </div>

      <span className="mb-2 mt-4 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        Tags
      </span>
      {tags.length === 0 && <span className="text-sm text-[var(--app-text-muted)]">Crie tags primeiro</span>}
      <div className="space-y-2">
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[var(--app-bg-muted)]"
          >
            <input
              type="checkbox"
              checked={selTags.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
              className="checkbox checkbox-sm"
            />
            <span className="h-2 w-2 rounded-full" style={{ background: tag.color }} />
            <span className="text-sm text-[var(--app-text)]">{tag.name}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={handleSave} className="btn btn-primary min-h-[44px] flex-1 border-0">
          Salvar
        </button>
        {mode === "edit" && task && (
          <button
            onClick={() => onDelete(task)}
            className="btn btn-outline min-h-[44px] border-red-300 text-red-500 hover:border-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
