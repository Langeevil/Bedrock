import { useState } from "react";
import type { Task, Tag } from "../types";
import { STATUS_META } from "../../constants/projectConstants";

interface Props {
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (id: string) => void;
}

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onClick: (id: string) => void;
}

function TaskCard({ task, tags, onClick }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const taskTags = task.tags
    .map(id => tags.find(t => t.id === id))
    .filter((t): t is Tag => Boolean(t));

  return (
    <div
      onClick={() => onClick(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `0.5px solid ${hovered ? "#ccc9bf" : "#e2e0d8"}`,
        borderRadius: 10, padding: "13px 15px", cursor: "pointer",
        transition: "all .15s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,.06)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: taskTags.length > 0 ? 8 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18", lineHeight: 1.4, flex: 1, marginRight: 8 }}>
          {task.title}
        </div>
        <span style={{
          padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, flexShrink: 0,
          background: STATUS_META[task.status].bg,
          color:      STATUS_META[task.status].color,
        }}>
          {STATUS_META[task.status].label}
        </span>
      </div>

      {taskTags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {taskTags.map(tg => (
            <span
              key={tg.id}
              style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: tg.color + "22", color: tg.color }}
            >
              {tg.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TasksView({ tasks, tags, onTaskClick }: Props) {
  if (tasks.length === 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f4f3ef" }}>
        <div style={{
          textAlign: "center", padding: "60px 0",
          borderRadius: 12, border: "2px dashed #e2e0d8",
          color: "#9c9a8e", fontSize: 13,
        }}>
          Nenhuma tarefa ainda. Use <strong>+ tarefa</strong> para começar.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f4f3ef" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} tags={tags} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
}