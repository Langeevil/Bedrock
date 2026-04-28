import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import type { Task, TabKey, PanelState } from "../types/projectTypes";
import type { TaskPanelPayload } from "../components/TaskPanel/TaskPanel";
import { useProjects } from "../hooks/useProjects";
import { ProjectHeader } from "../components/ProjectHeader";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { GraphView } from "../components/GraphView";
import { TasksView } from "../components/TasksView";
import { TagsView } from "../components/TagsView";
import { TaskPanel } from "../components/TaskPanel";
import { SidebarSimple } from "../../../components/sidebar-simple";

interface CreateProjectModalProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function CreateProjectModal({ onConfirm, onCancel }: CreateProjectModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 px-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          novo projeto
        </div>
        <div className="mb-5 text-xl font-semibold text-[var(--app-text)]">Como vai chamar?</div>

        <form onSubmit={handleSubmit}>
          <input
            aria-label="Nome do novo projeto"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: TCC, App Mobile, Site..."
            maxLength={60}
            className="input input-bordered app-input mb-5 min-h-[44px] w-full text-base"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="btn btn-outline min-h-[44px]">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn-primary min-h-[44px] border-0 disabled:bg-[var(--app-bg-muted)] disabled:text-[var(--app-text-muted)]"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--app-bg)] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9c9a8e" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>

      <div>
        <div className="mb-1 text-base font-semibold text-[var(--app-text)]">Nenhum projeto ainda</div>
        <div className="mx-auto max-w-xs text-sm text-[var(--app-text-muted)]">
          Crie um projeto para começar a organizar tarefas agrupadas por tags no grafo.
        </div>
      </div>

      <button onClick={onCreate} className="btn btn-primary min-h-[44px] border-0">
        + Criar primeiro projeto
      </button>
    </div>
  );
}

function ContentWithPanel({
  panel,
  tags,
  onClose,
  onSave,
  onDelete,
  children,
}: {
  panel: PanelState;
  tags: ReturnType<typeof useProjects>["tags"];
  onClose: () => void;
  onSave: (payload: TaskPanelPayload) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 overflow-hidden">
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

export default function ProjectsScreen() {
  const {
    projects,
    activeProject,
    selectProject,
    createProject,
    tasks,
    tags,
    stats,
    addTag,
    deleteTag,
    addTask,
    updateTask,
    deleteTask,
    loading,
  } = useProjects();

  const [activeTab, setActiveTab] = useState<TabKey>("graph");
  const [showModal, setShowModal] = useState(false);
  const [panel, setPanel] = useState<PanelState>({ open: false, mode: null, task: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreateProject = useCallback(
    async (name: string) => {
      await createProject(name);
      setShowModal(false);
    },
    [createProject]
  );

  const openNew = useCallback(() => {
    setPanel({ open: true, mode: "new", task: null });
  }, []);

  const openEdit = useCallback(
    (id: string) => {
      const task = tasks.find((item) => item.id === id);
      if (task) setPanel({ open: true, mode: "edit", task });
    },
    [tasks]
  );

  const closePanel = useCallback(() => {
    setPanel((current) => ({ ...current, open: false }));
  }, []);

  const handleSave = useCallback(
    async (payload: TaskPanelPayload) => {
      if (!activeProject) return;
      if (panel.mode === "new") {
        await addTask({ title: payload.title, status: payload.status, tags: payload.tags });
      } else {
        await updateTask({ ...payload, project_id: activeProject.id });
      }
      closePanel();
    },
    [panel.mode, activeProject, addTask, updateTask, closePanel]
  );

  const handleDelete = useCallback(
    async (task: Task) => {
      await deleteTask(task);
      closePanel();
    },
    [deleteTask, closePanel]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center bg-[var(--app-bg)]">
          <div className="text-sm text-[var(--app-text-muted)]">Carregando...</div>
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
            <GraphView tasks={tasks} tags={tags} projectName={activeProject.name} onTaskClick={openEdit} />
          </ContentWithPanel>
        );
      case "tasks":
        return (
          <ContentWithPanel {...panelProps}>
            <TasksView tasks={tasks} tags={tags} onTaskClick={openEdit} />
          </ContentWithPanel>
        );
      case "tags":
        return <TagsView tags={tags} tasks={tasks} onAddTag={addTag} onDeleteTag={deleteTag} />;
    }
  };

  return (
    <div className="app-page flex h-dvh overflow-hidden">
      <div className="hidden lg:block">
        <SidebarSimple />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="h-full max-w-[85vw]" onClick={(event) => event.stopPropagation()}>
            <SidebarSimple />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] text-[var(--app-text)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-semibold text-[var(--app-text)]">Projetos</span>
        </div>

        <ProjectHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewTask={openNew}
          activeProject={activeProject}
          projects={projects}
          onSelectProject={selectProject}
          onCreateProject={() => setShowModal(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
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

      {showModal && <CreateProjectModal onConfirm={handleCreateProject} onCancel={() => setShowModal(false)} />}
    </div>
  );
}
