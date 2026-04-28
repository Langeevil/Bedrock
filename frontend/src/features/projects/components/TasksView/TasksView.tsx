import { useState } from "react";
import type { Task, Tag } from "../../types";
import { STATUS_META } from "../../constants/projectConstants";

interface Props {
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (id: string) => void;
}

function TaskCard({
  task,
  tags,
  onClick,
}: {
  task: Task;
  tags: Tag[];
  onClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const taskTags = task.tags
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is Tag => Boolean(tag));

  return (
    <button
      type="button"
      onClick={() => onClick(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full rounded-2xl border bg-[var(--app-bg-elevated)] p-4 text-left transition ${
        hovered
          ? "border-[color:color-mix(in_srgb,var(--app-text)_20%,var(--app-border))] shadow-lg"
          : "border-[var(--app-border)] shadow-sm"
      }`}
    >
      <div className={`flex items-start justify-between gap-3 ${taskTags.length > 0 ? "mb-3" : ""}`}>
        <div className="flex-1 text-sm font-medium leading-6 text-[var(--app-text)]">
          {task.title}
        </div>
        <span
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold"
          style={{
            background: STATUS_META[task.status].bg,
            color: STATUS_META[task.status].color,
          }}
        >
          {STATUS_META[task.status].label}
        </span>
      </div>

      {taskTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: `${tag.color}22`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export function TasksView({ tasks, tags, onTaskClick }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[var(--app-bg)] p-4 sm:p-6">
        <div className="rounded-2xl border-2 border-dashed border-[var(--app-border)] px-4 py-16 text-center text-sm text-[var(--app-text-muted)]">
          Nenhuma tarefa ainda. Use <strong>+ tarefa</strong> para começar.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--app-bg)] p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} tags={tags} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
}
