import { useState, useEffect } from "react";
import type { Task, Tag, TaskStatus } from "../../types/projectTypes";
import { STATUS_META } from "../../constants/projectConstants";

// ── Types ─────────────────────────────────────────────────────────────────────
// The panel emits everything except project_id — parent injects that.
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

// ── Component ─────────────────────────────────────────────────────────────────
export function TaskPanel({
  open, mode, task, tags,
  onClose, onSave, onDelete,
}: TaskPanelProps) {
  const [title,   setTitle]   = useState("");
  const [status,  setStatus]  = useState<TaskStatus>("todo");
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
    setSelTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    // project_id omitted intentionally — ProjectsScreen injects it before calling the service
    const payload: TaskPanelPayload = {
      id:     task?.id ?? "t" + Date.now(),
      title:  title.trim(),
      status,
      tags:   selTags,
    };
    await onSave(payload);
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 10, color: "#9c9a8e",
    textTransform: "uppercase", letterSpacing: "0.07em",
    marginBottom: 6, marginTop: 14,
  };

  return (
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: 288,
      background: "#fff", borderLeft: "0.5px solid #e2e0d8",
      padding: 20, overflowY: "auto", zIndex: 20,
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition: "transform .2s ease",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 14, right: 14, width: 26, height: 26,
          border: "none", background: "none", cursor: "pointer",
          color: "#6b6960", fontSize: 16, borderRadius: 5,
        }}
      >
        ✕
      </button>

      <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18", marginBottom: 16 }}>
        {mode === "new" ? "Nova Tarefa" : "Editar Tarefa"}
      </div>

      {/* Title */}
      <span style={{ ...labelStyle, marginTop: 0 }}>Título</span>
      <input
        aria-label="Nome da tarefa"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSave()}
        placeholder="Nome da tarefa..."
        style={{
          width: "100%", padding: "7px 10px",
          border: "0.5px solid #e2e0d8", borderRadius: 6,
          fontSize: 13, fontFamily: "inherit", color: "#1a1a18",
          background: "#f4f3ef", outline: "none", boxSizing: "border-box",
        }}
      />

      {/* Status */}
      <span style={labelStyle}>Status</span>
      <div style={{ display: "flex", gap: 5 }}>
        {(Object.entries(STATUS_META) as [TaskStatus, typeof STATUS_META[TaskStatus]][]).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            style={{
              padding: "4px 10px", borderRadius: 5, fontSize: 11,
              cursor: "pointer", border: "0.5px solid #e2e0d8",
              fontFamily: "inherit", transition: "all .12s",
              background: status === key ? "#1a1a18" : "#fff",
              color:      status === key ? "#f4f3ef" : "#6b6960",
            }}
          >
            {meta.label}
          </button>
        ))}
      </div>

      {/* Tags */}
      <span style={labelStyle}>Tags</span>
      {tags.length === 0 && (
        <span style={{ fontSize: 12, color: "#9c9a8e" }}>Crie tags primeiro</span>
      )}
      {tags.map(tg => (
        <label
          key={tg.id}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 7px", borderRadius: 5, cursor: "pointer", marginBottom: 3,
          }}
        >
          <input
            type="checkbox"
            checked={selTags.includes(tg.id)}
            onChange={() => toggleTag(tg.id)}
            style={{ accentColor: "#1a1a18" }}
          />
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: tg.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#1a1a18" }}>{tg.name}</span>
        </label>
      ))}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 13,
            cursor: "pointer", border: "0.5px solid #1a1a18",
            background: "#1a1a18", color: "#f4f3ef", fontFamily: "inherit",
          }}
        >
          Salvar
        </button>
        {mode === "edit" && task && (
          <button
            onClick={() => onDelete(task)}
            style={{
              padding: "7px 12px", borderRadius: 6, fontSize: 13,
              cursor: "pointer", border: "0.5px solid #e8c8c0",
              background: "#fff", color: "#c0563b", fontFamily: "inherit",
            }}
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
