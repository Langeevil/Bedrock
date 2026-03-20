import { useState, useEffect } from "react";
import { STATUS_META } from "../constants";

const css = {
  panel: (open) => ({
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 288,
    background: "#fff",
    borderLeft: "0.5px solid #e2e0d8",
    padding: 20,
    overflowY: "auto",
    zIndex: 20,
    transform: open ? "translateX(0)" : "translateX(100%)",
    transition: "transform .2s ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }),
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#6b6960",
    fontSize: 16,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: 500, color: "#1a1a18", marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 10,
    color: "#9c9a8e",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    border: "0.5px solid #e2e0d8",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    color: "#1a1a18",
    background: "#f4f3ef",
    outline: "none",
    boxSizing: "border-box",
  },
  statusRow: { display: "flex", gap: 5 },
  statusBtn: (active) => ({
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 11,
    cursor: "pointer",
    border: "0.5px solid #e2e0d8",
    fontFamily: "inherit",
    transition: "all .12s",
    background: active ? "#1a1a18" : "#fff",
    color: active ? "#f4f3ef" : "#6b6960",
  }),
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 7px",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 3,
    transition: "background .12s",
  },
  tagDot: (color) => ({ width: 7, height: 7, borderRadius: "50%", background: color }),
  actions: { display: "flex", gap: 8, marginTop: 22 },
  saveBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    border: "0.5px solid #1a1a18",
    background: "#1a1a18",
    color: "#f4f3ef",
    fontFamily: "inherit",
  },
  deleteBtn: {
    padding: "7px 12px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    border: "0.5px solid #e8c8c0",
    background: "#fff",
    color: "#c0563b",
    fontFamily: "inherit",
  },
};

export function TaskPanel({ open, mode, task, tags, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [selTags, setSelTags] = useState([]);
  const [checkHover, setCheckHover] = useState(null);

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

  const toggleTag = (id) =>
    setSelTags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(task || { id: "t" + Date.now() }),
      title: title.trim(),
      status,
      tags: selTags,
    });
  };

  return (
    <div style={css.panel(open)}>
      <button style={css.closeBtn} onClick={onClose}>
        ✕
      </button>
      <div style={css.title}>{mode === "new" ? "Nova Tarefa" : "Editar Tarefa"}</div>

      <span style={css.label}>Título</span>
      <input
        style={css.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="Nome da tarefa..."
      />

      <span style={css.label}>Status</span>
      <div style={css.statusRow}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button key={key} style={css.statusBtn(status === key)} onClick={() => setStatus(key)}>
            {meta.label}
          </button>
        ))}
      </div>

      <span style={css.label}>Tags</span>
      {tags.length === 0 && (
        <span style={{ fontSize: 12, color: "#9c9a8e" }}>Crie tags primeiro</span>
      )}
      {tags.map((tg) => (
        <label
          key={tg.id}
          style={{
            ...css.checkRow,
            background: checkHover === tg.id ? "#f4f3ef" : "transparent",
          }}
          onMouseEnter={() => setCheckHover(tg.id)}
          onMouseLeave={() => setCheckHover(null)}
        >
          <input
            type="checkbox"
            checked={selTags.includes(tg.id)}
            onChange={() => toggleTag(tg.id)}
            style={{ accentColor: "#1a1a18" }}
          />
          <span style={css.tagDot(tg.color)} />
          <span style={{ fontSize: 13, color: "#1a1a18" }}>{tg.name}</span>
        </label>
      ))}

      <div style={css.actions}>
        <button style={css.saveBtn} onClick={handleSave}>
          Salvar
        </button>
        {mode === "edit" && task && (
          <button style={css.deleteBtn} onClick={() => onDelete(task.id)}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
