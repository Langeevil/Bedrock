import { SidebarSimple } from "../../../components/sidebar-simple";
import { useProjects } from "../hooks/useProjects";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectStats } from "../components/ProjectStats";
import { ProjectChart } from "../components/ProjectChart";
import { ProjectCard } from "../components/ProjectCard";
import type { ProjectStatus } from "../types/projectTypes";

export default function ProjectsScreen() {
  const { projects, loading, addProject, updateStatus, removeProject } = useProjects();

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <SidebarSimple />

      <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Projetos</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>Gerencie suas iniciativas e acompanhe o progresso</p>
        </header>

        {/* Form */}
        <div style={{ marginBottom: 32 }}>
          <ProjectForm onAdd={addProject} />
        </div>

        {/* Stats + Chart */}
        {projects.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 32, alignItems: "start" }}>
            <ProjectStats projects={projects} />
            <ProjectChart projects={projects} />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Nenhum projeto ainda. Crie o primeiro acima.</p>
          </div>
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
      </main>
    </div>
  );
}