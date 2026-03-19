import type { Project, ProjectStatus } from "../types/projectTypes";

interface Props {
  project: Project;
  onUpdateStatus: (id: string, status: ProjectStatus) => void;
  onRemove: (id: string) => void;
}

const statusStyle: Record<ProjectStatus, { color: string; bg: string; label: string }> = {
  planejado:      { color: "#64748b", bg: "#f1f5f9", label: "Planejado" },
  "em andamento": { color: "#2563eb", bg: "#dbeafe", label: "Em Andamento" },
  concluido:      { color: "#059669", bg: "#d1fae5", label: "Concluído" },
};

export function ProjectCard({ project, onUpdateStatus, onRemove }: Props) {
  // Adiciona fallback para evitar erro de 'undefined' na leitura de .color
  const status = project.status || "planejado";
  const s = statusStyle[status] || statusStyle["planejado"];

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 20,
      border: "1px solid #f1f5f9", boxShadow: "0 1px 3px #0001",
      display: "flex", flexDirection: "column", gap: 12,
      transition: "box-shadow .2s, transform .2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px #0000000d"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px #0001"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{project.title}</h3>
        <button onClick={() => onRemove(project.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 2 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}
        >
          <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
        {project.description || "Nenhuma descrição."}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, borderRadius: 99, padding: "3px 10px" }}>
          {s.label}
        </span>
        <select
          value={project.status}
          onChange={e => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
          style={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: "3px 8px", color: "#475569", background: "#fff", cursor: "pointer" }}
        >
          <option value="planejado">Planejado</option>
          <option value="em andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>

      <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>
        {new Date(project.createdAt || Date.now()).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}