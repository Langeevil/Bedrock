import { TagSection } from "./TagSection";
import { TaskMiniList } from "./TaskMiniList";

const css = {
  sidebar: {
    width: 264,
    flexShrink: 0,
    background: "#ffffff",
    borderRight: "0.5px solid #e2e0d8",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    borderBottom: "0.5px solid #e2e0d8",
  },
  statCard: (last) => ({
    padding: "12px 14px",
    borderRight: last ? "none" : "0.5px solid #e2e0d8",
  }),
  statValue: {
    fontFamily: "monospace",
    fontSize: 20,
    fontWeight: 600,
    color: "#1a1a18",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "#9c9a8e",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginTop: 3,
  },
};

function StatCard({ label, value, last }) {
  return (
    <div style={css.statCard(last)}>
      <div style={css.statValue}>{value}</div>
      <div style={css.statLabel}>{label}</div>
    </div>
  );
}

export function ProjectSidebar({ tasks, tags, stats, onAddTag, onDeleteTag, onTaskClick }) {
  return (
    <aside style={css.sidebar}>
      {/* Stats */}
      <div style={css.statsBar}>
        <StatCard label="tarefas" value={stats.total} />
        <StatCard label="tags" value={stats.tagCount} />
        <StatCard label="concluídas" value={stats.done} last />
      </div>

      {/* Tags CRUD */}
      <TagSection tags={tags} tasks={tasks} onAddTag={onAddTag} onDeleteTag={onDeleteTag} />

      {/* Mini task list */}
      <TaskMiniList tasks={tasks} tags={tags} onTaskClick={onTaskClick} />
    </aside>
  );
}
