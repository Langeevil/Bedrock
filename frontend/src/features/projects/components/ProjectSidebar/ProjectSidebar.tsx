import type { Task, Tag, ProjectStats } from "../types";
import { TagSection } from "../TagSection/TagSection";
import { TaskMiniList } from "../TaskMiniList/TaskMiniList";

interface Props {
  tasks: Task[];
  tags: Tag[];
  stats: ProjectStats;
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onTaskClick: (id: string) => void;
}

interface StatCardProps {
  label: string;
  value: number;
  last?: boolean;
}

function StatCard({ label, value, last = false }: StatCardProps) {
  return (
    <div style={{
      padding: "12px 14px",
      borderRight: last ? "none" : "0.5px solid #e2e0d8",
    }}>
      <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 600, color: "#1a1a18", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>
        {label}
      </div>
    </div>
  );
}

export function ProjectSidebar({ tasks, tags, stats, onAddTag, onDeleteTag, onTaskClick }: Props) {
  return (
    <aside style={{
      width: 264, flexShrink: 0, background: "#ffffff",
      borderRight: "0.5px solid #e2e0d8",
      display: "flex", flexDirection: "column", overflowY: "auto",
    }}>
      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "0.5px solid #e2e0d8" }}>
        <StatCard label="tarefas"    value={stats.total}    />
        <StatCard label="tags"       value={stats.tagCount} />
        <StatCard label="concluídas" value={stats.done} last />
      </div>

      <TagSection tags={tags} tasks={tasks} onAddTag={onAddTag} onDeleteTag={onDeleteTag} />
      <TaskMiniList tasks={tasks} tags={tags} onTaskClick={onTaskClick} />
    </aside>
  );
}