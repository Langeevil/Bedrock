import { useState } from "react";
import type { Task, Tag } from "../types";
import { STATUS_META } from "../../constants/projectConstants";

interface Props {
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (id: string) => void;
}

interface MiniCardProps {
  task: Task;
  tags: Tag[];
  onClick: (id: string) => void;
}

function MiniCard({ task, tags, onClick }: MiniCardProps) {
  const [hovered, setHovered] = useState(false);
  const taskTags = task.tags.map(id => tags.find(t => t.id === id)).filter((t): t is Tag => Boolean(t));

  return (
    <div
      onClick={() => onClick(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 9px", borderRadius: 6,
        border: `0.5px solid ${hovered ? "#ccc9bf" : "#e2e0d8"}`,
        marginBottom: 5,
        background: hovered ? "#f4f3ef" : "#fff",
        cursor: "pointer", transition: "all .12s",
      }}
    >
      <div style={{ fontSize: 12, color: "#1a1a18", marginBottom: 4, lineHeight: 1.35 }}>
        {task.title}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{
          padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 500,
          background: STATUS_META[task.status].bg,
          color: STATUS_META[task.status].color,
        }}>
          {STATUS_META[task.status].label}
        </span>
        {taskTags.map(tg => (
          <span
            key={tg.id}
            style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 500, background: tg.color + "22", color: tg.color }}
          >
            {tg.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TaskMiniList({ tasks, tags, onTaskClick }: Props) {
  return (
    <div style={{ padding: 14, flex: 1, overflowY: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        Tarefas
      </div>

      {tasks.length === 0 && (
        <span style={{ fontSize: 12, color: "#9c9a8e" }}>Nenhuma tarefa ainda</span>
      )}
      {tasks.map(task => (
        <MiniCard key={task.id} task={task} tags={tags} onClick={onTaskClick} />
      ))}
    </div>
  );
}