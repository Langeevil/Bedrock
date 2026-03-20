import { useState } from "react";
import { STATUS_META } from "../constants";

const css = {
  container: {
    flex: 1, overflowY: "auto", padding: 24,
    background: "#f4f3ef",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 12,
  },
  card: (hovered) => ({
    background: "#fff",
    border: "0.5px solid " + (hovered ? "#ccc9bf" : "#e2e0d8"),
    borderRadius: 10, padding: "13px 15px",
    cursor: "pointer", transition: "all .15s",
    boxShadow: hovered ? "0 2px 12px rgba(0,0,0,.06)" : "none",
  }),
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: 500, color: "#1a1a18", lineHeight: 1.4, flex: 1, marginRight: 8 },
  badge: (st) => ({
    padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500,
    flexShrink: 0,
    background: STATUS_META[st].bg, color: STATUS_META[st].color,
  }),
  tagsRow: { display: "flex", gap: 4, flexWrap: "wrap" },
  tagChip: (color) => ({
    padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500,
    background: color + "22", color,
  }),
  empty: {
    textAlign: "center", padding: "60px 0",
    borderRadius: 12, border: "2px dashed #e2e0d8",
    color: "#9c9a8e", fontSize: 13,
  },
};

function TaskCard({ task, tags, onClick }) {
  const [hovered, setHovered] = useState(false);
  const taskTags = task.tags.map(id => tags.find(t => t.id === id)).filter(Boolean);

  return (
    <div
      style={css.card(hovered)}
      onClick={() => onClick(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={css.cardTop}>
        <div style={css.cardTitle}>{task.title}</div>
        <span style={css.badge(task.status)}>{STATUS_META[task.status].label}</span>
      </div>
      {taskTags.length > 0 && (
        <div style={css.tagsRow}>
          {taskTags.map(tg => (
            <span key={tg.id} style={css.tagChip(tg.color)}>{tg.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TasksView({ tasks, tags, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <div style={css.container}>
        <div style={css.empty}>
          Nenhuma tarefa ainda. Use <strong>+ tarefa</strong> para começar.
        </div>
      </div>
    );
  }

  return (
    <div style={css.container}>
      <div style={css.grid}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            tags={tags}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}