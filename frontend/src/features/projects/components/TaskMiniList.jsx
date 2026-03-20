import { useState } from "react";
import { STATUS_META } from "../constants";

const css = {
  section: { padding: "14px", flex: 1 },
  title: {
    fontSize: 10, fontWeight: 500, color: "#9c9a8e",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
  },
  card: (hovered) => ({
    padding: "8px 9px", borderRadius: 6,
    border: "0.5px solid " + (hovered ? "#ccc9bf" : "#e2e0d8"),
    marginBottom: 5, background: hovered ? "#f4f3ef" : "#fff",
    cursor: "pointer", transition: "all .12s",
  }),
  cardTitle: { fontSize: 12, color: "#1a1a18", marginBottom: 4, lineHeight: 1.35 },
  meta: { display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" },
  badge: (st) => ({
    padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 500,
    background: STATUS_META[st].bg, color: STATUS_META[st].color,
  }),
  miniTag: (color) => ({
    padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 500,
    background: color + "22", color,
  }),
};

function MiniTaskCard({ task, tags, onClick }) {
  const [hovered, setHovered] = useState(false);
  const taskTags = task.tags.map(id => tags.find(t => t.id === id)).filter(Boolean);

  return (
    <div
      style={css.card(hovered)}
      onClick={() => onClick(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={css.cardTitle}>{task.title}</div>
      <div style={css.meta}>
        <span style={css.badge(task.status)}>{STATUS_META[task.status].label}</span>
        {taskTags.map(tg => (
          <span key={tg.id} style={css.miniTag(tg.color)}>{tg.name}</span>
        ))}
      </div>
    </div>
  );
}

export function TaskMiniList({ tasks, tags, onTaskClick }) {
  return (
    <div style={css.section}>
      <div style={css.title}>Tarefas</div>
      {tasks.length === 0 && (
        <span style={{ fontSize: 12, color: "#9c9a8e" }}>Nenhuma tarefa ainda</span>
      )}
      {tasks.map(task => (
        <MiniTaskCard
          key={task.id}
          task={task}
          tags={tags}
          onClick={onTaskClick}
        />
      ))}
    </div>
  );
}