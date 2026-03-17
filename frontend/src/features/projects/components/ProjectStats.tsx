import type { Project } from "../types/projectTypes";

interface Props {
  projects: Project[];
}

const statConfig = [
  { key: "planejado",    label: "Planejados",    color: "#94a3b8", bg: "#f1f5f9" },
  { key: "em andamento", label: "Em Andamento",  color: "#3b82f6", bg: "#eff6ff" },
  { key: "concluido",   label: "Concluídos",     color: "#10b981", bg: "#ecfdf5" },
] as const;

export function ProjectStats({ projects }: Props) {
  const total = projects.length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {statConfig.map(({ key, label, color, bg }) => {
        const count = projects.filter((p) => p.status === key).length;
        const pct = total ? Math.round((count / total) * 100) : 0;

        return (
          <div key={key} style={{ background: bg, borderRadius: 16, padding: "20px 24px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: ".04em", textTransform: "uppercase" }}>
              {label}
            </p>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", margin: "4px 0 8px" }}>
              {count}
            </p>
            <div style={{ height: 4, borderRadius: 99, background: "#e2e8f0" }}>
              <div style={{ height: 4, borderRadius: 99, background: color, width: `${pct}%`, transition: "width .6s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{pct}% do total</p>
          </div>
        );
      })}
    </div>
  );
}