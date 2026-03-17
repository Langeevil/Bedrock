import { useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { useProjects } from "../hooks/useProjects";
import { ProjectHeader } from "../components/ProjectHeader";
import { ProjectStats } from "../components/ProjectStats";
import { ProjectChart } from "../components/ProjectChart";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectGraph } from "../components/ProjectGraph";
import type { ProjectStatus, ProjectTabKey } from "../types/projectTypes";
import { TEAMS } from "../constants/TEAMS";

export default function ProjectsScreen() {
  const { projects, loading, addProject, updateStatus, removeProject } = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectTabKey>("overview");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5", fontFamily: "'Segoe UI', sans-serif" }}>
      <SidebarSimple />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ProjectHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projectCount={projects.length}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: 28, background: "#f5f5f5" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab {...{ projects, updateStatus, removeProject }} />}
              {activeTab === "graph"    && <ProjectGraph projects={projects} />}
              {activeTab === "new"      && <NewProjectTab onAdd={addProject} />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────────────────────────── */
function OverviewTab({ projects, updateStatus, removeProject }: {
  projects: ReturnType<typeof useProjects>["projects"];
  updateStatus: ReturnType<typeof useProjects>["updateStatus"];
  removeProject: ReturnType<typeof useProjects>["removeProject"];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {projects.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
          <ProjectStats projects={projects} />
          <ProjectChart projects={projects} />
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdateStatus={(id, s) => updateStatus(id, s as ProjectStatus)}
              onRemove={removeProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── New Project ───────────────────────────────────────────────────────────── */
function NewProjectTab({ onAdd }: { onAdd: (data: { title: string; description: string }) => Promise<void> }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13, color: TEAMS.textSecondary, marginBottom: 20 }}>
        Preencha os dados abaixo para criar um novo projeto.
      </p>
      <ProjectForm onAdd={onAdd} />
    </div>
  );
}

/* ─── Settings ──────────────────────────────────────────────────────────────── */
function SettingsTab() {
  return (
    <div style={{ maxWidth: 480 }}>
      <p style={{ fontSize: 13, color: TEAMS.textSecondary }}>
        Configurações do módulo de projetos em breve.
      </p>
    </div>
  );
}

/* ─── Empty ─────────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "60px 0",
      borderRadius: 12, border: "2px dashed #e2e8f0",
    }}>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>
        Nenhum projeto ainda. Vá em <strong>Novo Projeto</strong> para começar.
      </p>
    </div>
  );
}