import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  Video,
} from "lucide-react";
import type { Discipline } from "../services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";
import { TEAMS } from "../constants/teamsTheme";

const TABS: { id: TabKey; label: string }[] = [
  { id: "overview", label: "Visao Geral" },
  { id: "materials", label: "Arquivos" },
  { id: "chat", label: "Publicacoes" },
  { id: "members", label: "Membros" },
  { id: "settings", label: "Configuracoes" },
];

const ACTION_BTNS = [
  { id: "meeting", label: "Reuniao", Icon: Video },
  { id: "call", label: "Ligar", Icon: Phone },
  { id: "search", label: "Buscar", Icon: Search },
  { id: "notifications", label: "Notificacoes", Icon: Bell },
  { id: "favorite", label: "Favoritar", Icon: Star },
  { id: "more", label: "Mais", Icon: MoreHorizontal },
];

interface Props {
  discipline: Discipline;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function DisciplineHeader({ discipline, activeTab, onTabChange }: Readonly<Props>) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: TEAMS.white,
        borderBottom: `1px solid ${TEAMS.border}`,
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0 0", fontSize: 12 }}>
        <button
          onClick={() => navigate("/disciplinas")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: TEAMS.purple,
            fontSize: 12,
            fontFamily: "'Segoe UI', sans-serif",
            padding: 0,
          }}
        >
          <ChevronLeft size={14} /> Disciplinas
        </button>
        <span style={{ color: TEAMS.border }}>/</span>
        <span style={{ color: TEAMS.textSecondary }}>{discipline.name}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6264A7, #8764B8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1.2 }}>
              {discipline.name}
            </div>
            <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>
              {discipline.code} · {discipline.professor}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {ACTION_BTNS.map(({ id, label, Icon }) => (
            <button
              key={id}
              title={label}
              style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEAMS.textSecondary,
                padding: "6px 10px",
                borderRadius: 4,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F3F2F1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 8 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === t.id ? `2px solid ${TEAMS.purple}` : "2px solid transparent",
              color: activeTab === t.id ? TEAMS.purple : TEAMS.textSecondary,
              fontSize: 13,
              fontWeight: activeTab === t.id ? 600 : 400,
              cursor: "pointer",
              fontFamily: "'Segoe UI', sans-serif",
              transition: "all 0.15s",
              marginBottom: -1,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textPrimary;
            }}
            onMouseLeave={(e) => {
              if (activeTab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textSecondary;
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
