import type { Task, Tag, ProjectStats } from "../../types/projectTypes";
import { TagSection } from "../TagSection";
import { TaskMiniList } from "../TaskMiniList";

interface ProjectSidebarProps {
  tasks: Task[];
  tags: Tag[];
  stats: ProjectStats;
  onAddTag: (payload: Omit<Tag, "id" | "project_id">) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onTaskClick: (id: string) => void;
}

function StatCard({
  label,
  value,
  last = false,
}: {
  label: string;
  value: number;
  last?: boolean;
}) {
  return (
    <div className={`p-4 ${last ? "" : "border-r border-[var(--app-border)]"}`}>
      <div className="font-mono text-2xl font-semibold leading-none text-[var(--app-text)]">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        {label}
      </div>
    </div>
  );
}

export function ProjectSidebar({
  tasks,
  tags,
  stats,
  onAddTag,
  onDeleteTag,
  onTaskClick,
}: ProjectSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col overflow-y-auto border-b border-[var(--app-border)] bg-[var(--app-bg-elevated)] lg:w-[17rem] lg:border-b-0 lg:border-r">
      <div className="grid grid-cols-3 border-b border-[var(--app-border)]">
        <StatCard label="tarefas" value={stats.total} />
        <StatCard label="tags" value={stats.tagCount} />
        <StatCard label="concluidas" value={stats.done} last />
      </div>

      <TagSection tags={tags} tasks={tasks} onAddTag={onAddTag} onDeleteTag={onDeleteTag} />
      <TaskMiniList tasks={tasks} tags={tags} onTaskClick={onTaskClick} />
    </aside>
  );
}
