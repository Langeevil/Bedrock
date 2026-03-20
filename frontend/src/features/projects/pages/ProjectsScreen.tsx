import { useState, useCallback } from "react";
import { useProjects } from "../hooks/useProjects";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectSidebar } from "./ProjectSidebar";
import { GraphView } from "./GraphView";
import { TasksView } from "./TasksView";
import { TagsView } from "./TagsView";
import { TaskPanel } from "./TaskPanel";

export default function ProjectsScreen() {
  const { tasks, tags, stats, addTag, deleteTag, addTask, updateTask, deleteTask } = useProjects();

  const [activeTab, setActiveTab] = useState("graph");
  const [panel, setPanel] = useState({ open: false, mode: null, task: null });

  // ── Panel helpers ────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setPanel({ open: true, mode: "new", task: null });
  }, []);

  const openEdit = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) setPanel({ open: true, mode: "edit", task });
    },
    [tasks]
  );

  const closePanel = useCallback(() => {
    setPanel((p) => ({ ...p, open: false }));
  }, []);

  const handleSave = useCallback(
    (task) => {
      if (panel.mode === "new") addTask(task);
      else updateTask(task);
      closePanel();
    },
    [panel.mode, addTask, updateTask, closePanel]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteTask(id);
      closePanel();
    },
    [deleteTask, closePanel]
  );

  // ── Main content by tab ──────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "graph":
        return (
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <GraphView tasks={tasks} tags={tags} onTaskClick={openEdit} />
            <TaskPanel
              open={panel.open}
              mode={panel.mode}
              task={panel.task}
              tags={tags}
              onClose={closePanel}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        );
      case "tasks":
        return (
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex" }}>
            <TasksView tasks={tasks} tags={tags} onTaskClick={openEdit} />
            <TaskPanel
              open={panel.open}
              mode={panel.mode}
              task={panel.task}
              tags={tags}
              onClose={closePanel}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        );
      case "tags":
        return <TagsView tags={tags} tasks={tasks} onAddTag={addTag} onDeleteTag={deleteTag} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#f4f3ef",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <ProjectHeader activeTab={activeTab} onTabChange={setActiveTab} onNewTask={openNew} />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <ProjectSidebar
          tasks={tasks}
          tags={tags}
          stats={stats}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
          onTaskClick={openEdit}
        />

        {/* Content area */}
        {renderContent()}
      </div>
    </div>
  );
}
