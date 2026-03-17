import type { Project } from "../types/projectTypes";

interface Props {
  projects: Project[];
}

const SLICES = [
  { key: "concluido",    label: "Concluídos",    color: "#10b981" },
  { key: "em andamento", label: "Em Andamento",  color: "#3b82f6" },
  { key: "planejado",   label: "Planejados",     color: "#cbd5e1" },
] as const;

function buildDonut(values: number[], r = 60, stroke = 20) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return values.map((v, i) => {
    const pct = v / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const rotation = -90 + (offset / total) * 360;
    offset += v;
    return { dash, gap, rotation, cx, cy, r, circ, stroke };
  });
}

export function ProjectChart({ projects }: Props) {
  const values = SLICES.map(({ key }) => projects.filter((p) => p.status === key).length);
  const arcs = buildDonut(values);
  const total = projects.length;

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px #0001" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 24 }}>Distribuição por Status</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {/* SVG Donut */}
        <svg width={160} height={160} viewBox="0 0 160 160">
          {arcs.map(({ dash, gap, rotation, cx, cy, r, circ, stroke }, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={SLICES[i].color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          ))}
          <text x="80" y="75" textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: "#0f172a" }}>
            {total}
          </text>
          <text x="80" y="92" textAnchor="middle" style={{ fontSize: 11, fill: "#94a3b8" }}>
            projetos
          </text>
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SLICES.map(({ label, color, key }, i) => {
            const count = values[i];
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 99, background: color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{label}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{count} · {pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}