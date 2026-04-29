import { useState } from "react";
import type { Project, TabKey } from "../../types/projectTypes";
import { TABS } from "../../constants/projectConstants";

interface ProjectHeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewTask: () => void;
  activeProject: Project | null;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] !rounded-lg px-4 py-2.5 text-sm transition ${
        active
          ? "app-btn-surface bg-[var(--app-bg-elevated)] text-[var(--app-text)] shadow-sm"
          : "text-[var(--app-text-muted)] hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text)]"
      }`}
    >
      {label}
    </button>
  );
}

function ProjectDropdown({
  active,
  projects,
  onSelect,
  onCreate,
}: {
  active: Project | null;
  projects: Project[];
  onSelect: (project: Project) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`app-btn-surface flex min-h-[44px] !rounded-lg items-center gap-2.5 border px-4 py-2.5 text-sm transition ${
          active ? "text-[var(--app-text)]" : "border-dashed bg-transparent text-[var(--app-text-muted)]"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        <span className="max-w-[10rem] truncate font-medium sm:max-w-[12rem]">
          {active ? active.name : "Selecionar projeto"}
        </span>
        <span className="text-xs text-[var(--app-text-muted)]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[16rem] max-w-[85vw] rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-2 shadow-2xl">
            {projects.length === 0 && (
              <div className="px-3 py-2 text-sm text-[var(--app-text-muted)]">
                Nenhum projeto criado
              </div>
            )}

            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  onSelect(project);
                  setOpen(false);
                }}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  project.id === active?.id
                    ? "bg-[var(--app-bg-muted)] text-[var(--app-text)]"
                    : "text-[var(--app-text)] hover:bg-[var(--app-bg-muted)]"
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span className="flex-1 truncate">{project.name}</span>
                {project.id === active?.id && <span className="text-xs text-blue-500">✓</span>}
              </button>
            ))}

            <div className="my-1 border-t border-[var(--app-border)]" />

            <button
              type="button"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
              className="flex min-h-[44px] w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-blue-500 transition hover:bg-[var(--app-bg-muted)]"
            >
              + Novo projeto
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ProjectHeader({
  activeTab,
  onTabChange,
  onNewTask,
  activeProject,
  projects,
  onSelectProject,
  onCreateProject,
}: ProjectHeaderProps) {
  return (
    <header className="border-b border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text)]">
            proj
          </div>

          <ProjectDropdown
            active={activeProject}
            projects={projects}
            onSelect={onSelectProject}
            onCreate={onCreateProject}
          />

          {activeProject && (
            <nav className="scrollbar-thin flex gap-2 overflow-x-auto rounded-lg bg-[var(--app-bg-muted)] p-1.5">
              {TABS.map((tab) => (
                <TabButton
                  key={tab.key}
                  label={tab.label}
                  active={activeTab === tab.key}
                  onClick={() => onTabChange(tab.key)}
                />
              ))}
            </nav>
          )}
        </div>

        {activeProject && (
          <button
            type="button"
            onClick={onNewTask}
            className="btn btn-primary app-btn-primary min-h-[46px] !rounded-lg w-full border-0 px-5 sm:w-auto"
          >
            + tarefa
          </button>
        )}
      </div>
    </header>
  );
}
