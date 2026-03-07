// src/features/disciplines/components/tabs/SettingsTab.tsx

import type { Discipline } from "../../services/disciplinesService";
import { TEAMS } from "../../constants/teamsTheme";

interface Props {
  discipline: Discipline;
}

export function SettingsTab({ discipline }: Readonly<Props>) {
  const fields = [
    { id: "name",       label: "Nome",       value: discipline.name },
    { id: "code",       label: "Código",     value: discipline.code },
    { id: "professor",  label: "Professor",  value: discipline.professor },
    { id: "created_at", label: "Criado em",  value: discipline.created_at ? new Date(discipline.created_at).toLocaleDateString("pt-BR") : "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${TEAMS.border}`, fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, background: "#FAF9F8" }}>
          Informações da Disciplina
        </div>
        {fields.map((item, i) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 100px", alignItems: "center", padding: "14px 20px", borderBottom: i < fields.length - 1 ? `1px solid ${TEAMS.border}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textSecondary }}>{item.label}</span>
            <span style={{ fontSize: 14, color: TEAMS.textPrimary }}>{item.value}</span>
            <button style={{ border: `1px solid ${TEAMS.border}`, background: "transparent", borderRadius: 4, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: TEAMS.textSecondary, fontFamily: "'Segoe UI', sans-serif" }}>
              Editar
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: "#FEF0F1", border: "1px solid #F3D1D3", borderRadius: 8, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#A4262C", marginBottom: 6 }}>Zona de Perigo</div>
        <p style={{ fontSize: 13, color: "#605E5C", margin: "0 0 12px" }}>A exclusão da disciplina é permanente e não pode ser desfeita.</p>
        <button style={{ background: "#A4262C", color: "#fff", border: "none", borderRadius: 4, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
          Excluir Disciplina
        </button>
      </div>
    </div>
  );
}