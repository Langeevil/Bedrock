import { useState } from "react";
import type { Project, TabKey } from "../../types/projectTypes";
import { TABS } from "../../constants/projectConstants";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProjectHeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewTask: () => void;
  activeProject: Project | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onCreateProject: () => void;
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 6, fontSize: 13,
      cursor: "pointer", border: "none", fontFamily: "inherit",
      background: active ? "#fff" : "transparent",
      color:      active ? "#1a1a18" : "#6b6960",
      boxShadow:  active ? "0 0 0 0.5px #e2e0d8" : "none",
      transition: "all .15s",
    }}>
      {label}
    </button>
  );
}

// ── Project dropdown ──────────────────────────────────────────────────────────
function ProjectDropdown({ active, projects, onSelect, onCreate }: {
  active: Project | null;
  projects: Project[];
  onSelect: (p: Project) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      {active ? (
        <button onClick={() => setOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 11px", border: "0.5px solid #e2e0d8",
          borderRadius: 6, fontSize: 13, cursor: "pointer",
          background: "#fff", fontFamily: "inherit",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#4a6fa5", display: "inline-block", flexShrink: 0,
          }} />
          <span style={{ color: "#1a1a18", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {active.name}
          </span>
          <span style={{ color: "#ccc9bf", fontSize: 11 }}>▾</span>
        </button>
      ) : (
        <button onClick={() => setOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 11px", border: "0.5px dashed #ccc9bf",
          borderRadius: 6, fontSize: 13, color: "#9c9a8e",
          background: "transparent", cursor: "pointer", fontFamily: "inherit",
        }}>
          Selecionar projeto
          <span style={{ fontSize: 11 }}>▾</span>
        </button>
      )}

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#fff", border: "0.5px solid #e2e0d8",
            borderRadius: 8, padding: 6, minWidth: 220, zIndex: 100,
            boxShadow: "0 4px 20px rgba(0,0,0,.1)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            {projects.length === 0 && (
              <div style={{ fontSize: 12, color: "#9c9a8e", padding: "6px 8px" }}>
                Nenhum projeto criado
              </div>
            )}
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "7px 10px", borderRadius: 6,
                  border: "none", background: p.id === active?.id ? "#f4f3ef" : "transparent",
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                  color: "#1a1a18", textAlign: "left",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a6fa5", flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                {p.id === active?.id && (
                  <span style={{ fontSize: 11, color: "#4a6fa5" }}>✓</span>
                )}
              </button>
            ))}

            <div style={{ borderTop: "0.5px solid #f0efe9", margin: "4px 0" }} />

            <button
              onClick={() => { onCreate(); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "7px 10px", borderRadius: 6,
                border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, color: "#4a6fa5", textAlign: "left",
              }}
            >
              + Novo projeto
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ProjectHeader({
  activeTab, onTabChange, onNewTask,
  activeProject, projects, onSelectProject, onCreateProject,
}: ProjectHeaderProps) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", height: 52, background: "#ffffff",
      borderBottom: "0.5px solid #e2e0d8", gap: 12, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Logo */}
        <div style={{
          fontFamily: "monospace", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.06em", color: "#1a1a18",
          padding: "5px 9px", border: "0.5px solid #ccc9bf",
          borderRadius: 6, background: "#f4f3ef", userSelect: "none",
        }}>
          proj
        </div>

        <ProjectDropdown
          active={activeProject}
          projects={projects}
          onSelect={onSelectProject}
          onCreate={onCreateProject}
        />

        {/* Tabs — only when project is active */}
        {activeProject && (
          <nav style={{ display: "flex", gap: 2, background: "#f0efe9", borderRadius: 8, padding: 3 }}>
            {TABS.map(tab => (
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
        <button onClick={onNewTask} style={{
          padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
          border: "0.5px solid #1a1a18", background: "#1a1a18", color: "#f4f3ef",
          fontFamily: "inherit",
        }}>
          + tarefa
        </button>
      )}
    </header>
  );
}