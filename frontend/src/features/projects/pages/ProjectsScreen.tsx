import { useState, useCallback } from "react";
import type { Task, Tag, TabKey, PanelState } from "../types/projectTypes";
import { useProjects }      from "../hooks/useProjects";
import { ProjectHeader }    from "../components/ProjectHeader/ProjectHeader";
import { ProjectSidebar }   from "../components/ProjectSidebar/ProjectSidebar";
import { GraphView }        from "../components/GraphView/GraphView";
import { TasksView }        from "../components/TasksView/TasksView";
import { TagsView }         from "../components/TagsView/TagsView";
import { TaskPanel }        from "../components/TaskPanel/TaskPanel";

// ── Shared wrapper: content area + sliding TaskPanel ─────────────────────────
interface ContentWithPanelProps {
  panel: PanelState;
  tags: Tag[];
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  children: React.ReactNode;
}

function ContentWithPanel({
  panel, tags, onClose, onSave, onDelete, children,
}: ContentWithPanelProps) {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex" }}>
      {children}
      <TaskPanel
        open={panel.open}
        mode={panel.mode}
        task={panel.task}
        tags={tags}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectsScreen() {
  const {
    tasks, tags, stats,
    addTag, deleteTag,
    addTask, updateTask, deleteTask,
  } = useProjects();

  const [activeTab, setActiveTab] = useState<TabKey>("graph");
  const [panel, setPanel] = useState<PanelState>({ open: false, mode: null, task: null });

  // ── Panel handlers ─────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setPanel({ open: true, mode: "new", task: null });
  }, []);

  const openEdit = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) setPanel({ open: true, mode: "edit", task });
  }, [tasks]);

  const closePanel = useCallback(() => {
    setPanel(prev => ({ ...prev, open: false }));
  }, []);

  const handleSave = useCallback(async (task: Task) => {
    if (panel.mode === "new") await addTask(task);
    else await updateTask(task);
    closePanel();
  }, [panel.mode, addTask, updateTask, closePanel]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteTask(id);
    closePanel();
  }, [deleteTask, closePanel]);

  // ── Tab routing ────────────────────────────────────────────────────────────
  const renderContent = () => {
    const panelProps = { panel, tags, onClose: closePanel, onSave: handleSave, onDelete: handleDelete };

    switch (activeTab) {
      case "graph":
        return (
          <ContentWithPanel {...panelProps}>
            <GraphView tasks={tasks} tags={tags} onTaskClick={openEdit} />
          </ContentWithPanel>
        );
      case "tasks":
        return (
          <ContentWithPanel {...panelProps}>
            <TasksView tasks={tasks} tags={tags} onTaskClick={openEdit} />
          </ContentWithPanel>
        );
      case "tags":
        return (
          <TagsView
            tags={tags}
            tasks={tasks}
            onAddTag={addTag}
            onDeleteTag={deleteTag}
          />
        );
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "#f4f3ef",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <ProjectHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTask={openNew}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ProjectSidebar
          tasks={tasks}
          tags={tags}
          stats={stats}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
          onTaskClick={openEdit}
        />
        {renderContent()}
      </div>
    </div>
  );
}