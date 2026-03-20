import { useState, useCallback } from "react";
import type { Task, TabKey, PanelState } from "../types/projectTypes";
import type { TaskPanelPayload } from "../components/TaskPanel/TaskPanel";
import { useProjects }    from "../hooks/useProjects";
import { ProjectHeader }  from "../components/ProjectHeader";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { GraphView }      from "../components/GraphView";
import { TasksView }      from "../components/TasksView";
import { TagsView }       from "../components/TagsView";
import { TaskPanel }      from "../components/TaskPanel";
import { SidebarSimple }  from "../../../components/sidebar-simple";

// ── Create Project Modal ──────────────────────────────────────────────────────
interface CreateProjectModalProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function CreateProjectModal({ onConfirm, onCancel }: CreateProjectModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          padding: "32px 28px", width: 420,
          border: "0.5px solid #e2e0d8",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 11, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 6 }}>
          novo projeto
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a18", marginBottom: 20 }}>
          Como vai chamar?
        </div>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: TCC, App Mobile, Site..."
            maxLength={60}
            style={{
              width: "100%", padding: "10px 13px",
              border: "0.5px solid #ccc9bf", borderRadius: 8,
              fontSize: 14, fontFamily: "inherit", color: "#1a1a18",
              background: "#f4f3ef", outline: "none", boxSizing: "border-box",
              marginBottom: 20,
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "9px 18px", borderRadius: 8, fontSize: 14,
                cursor: "pointer", border: "0.5px solid #e2e0d8",
                background: "#fff", color: "#6b6960", fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: "9px 22px", borderRadius: 8, fontSize: 14,
                cursor: name.trim() ? "pointer" : "not-allowed",
                border: "0.5px solid #1a1a18",
                background: name.trim() ? "#1a1a18" : "#e2e0d8",
                color: name.trim() ? "#f4f3ef" : "#9c9a8e",
                fontFamily: "inherit", fontWeight: 500, transition: "all .15s",
              }}
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#f4f3ef", gap: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "#fff", border: "0.5px solid #e2e0d8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9c9a8e" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a18", marginBottom: 6 }}>
          Nenhum projeto ainda
        </div>
        <div style={{ fontSize: 13, color: "#9c9a8e", maxWidth: 260 }}>
          Crie um projeto para começar a organizar tarefas agrupadas por tags no grafo.
        </div>
      </div>

      <button
        onClick={onCreate}
        style={{
          marginTop: 8, padding: "10px 24px", borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: "pointer",
          border: "0.5px solid #1a1a18",
          background: "#1a1a18", color: "#f4f3ef",
          fontFamily: "inherit",
        }}
      >
        + Criar primeiro projeto
      </button>
    </div>
  );
}

// ── Content + panel wrapper ───────────────────────────────────────────────────
interface ContentWithPanelProps {
  panel: PanelState;
  tags: ReturnType<typeof useProjects>["tags"];
  onClose: () => void;
  onSave: (payload: TaskPanelPayload) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  children: React.ReactNode;
}

function ContentWithPanel({ panel, tags, onClose, onSave, onDelete, children }: ContentWithPanelProps) {
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectsScreen() {
  const {
    projects, activeProject, selectProject, createProject,
    tasks, tags, stats,
    addTag, deleteTag,
    addTask, updateTask, deleteTask,
    loading,
  } = useProjects();

  const [activeTab, setActiveTab]       = useState<TabKey>("graph");
  const [showModal, setShowModal]       = useState(false);
  const [panel, setPanel]               = useState<PanelState>({ open: false, mode: null, task: null });

  // ── Project ────────────────────────────────────────────────────────────────
  const handleCreateProject = useCallback(async (name: string) => {
    await createProject(name);
    setShowModal(false);
  }, [createProject]);

  // ── Panel ──────────────────────────────────────────────────────────────────
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

  const handleSave = useCallback(async (payload: TaskPanelPayload) => {
    if (!activeProject) return;
    if (panel.mode === "new") {
      // addTask expects Omit<Task, "id" | "project_id"> — hook injects both
      await addTask({ title: payload.title, status: payload.status, tags: payload.tags });
    } else {
      // updateTask expects full Task — inject project_id from active project
      await updateTask({ ...payload, project_id: activeProject.id });
    }
    closePanel();
  }, [panel.mode, activeProject, addTask, updateTask, closePanel]);

  const handleDelete = useCallback(async (task: Task) => {
    await deleteTask(task);
    closePanel();
  }, [deleteTask, closePanel]);

  // ── Tab content ────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f3ef" }}>
          <div style={{ fontSize: 13, color: "#9c9a8e" }}>Carregando...</div>
        </div>
      );
    }

    if (!activeProject) {
      return <EmptyProjects onCreate={() => setShowModal(true)} />;
    }

    const panelProps = { panel, tags, onClose: closePanel, onSave: handleSave, onDelete: handleDelete };

    switch (activeTab) {
      case "graph":
        return (
          <ContentWithPanel {...panelProps}>
            <GraphView
              tasks={tasks}
              tags={tags}
              projectName={activeProject.name}
              onTaskClick={openEdit}
            />
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
      overflow: "hidden",
    }}>
      {/* App-level sidebar */}
      <SidebarSimple />

      {/* Feature column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ProjectHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewTask={openNew}
          activeProject={activeProject}
          projects={projects}
          onSelectProject={selectProject}
          onCreateProject={() => setShowModal(true)}
        />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {activeProject && (
            <ProjectSidebar
              tasks={tasks}
              tags={tags}
              stats={stats}
              onAddTag={addTag}
              onDeleteTag={deleteTag}
              onTaskClick={openEdit}
            />
          )}
          {renderContent()}
        </div>
      </div>

      {showModal && (
        <CreateProjectModal
          onConfirm={handleCreateProject}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}