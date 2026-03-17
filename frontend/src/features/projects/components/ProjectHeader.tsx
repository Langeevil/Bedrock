import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, FolderKanban,
  Search, Bell, Star, MoreHorizontal, SlidersHorizontal,
} from "lucide-react";
import { TEAMS } from "../constants/TEAMS";
import type { ProjectTabKey } from "../types/projectTypes";

export const PROJECT_TABS: { id: ProjectTabKey; label: string }[] = [
  { id: "overview",    label: "Visão Geral"   },
  { id: "graph",       label: "Grafo"         },
  { id: "new",         label: "Novo Projeto"  },
  { id: "settings",    label: "Configurações" },
];

const ACTION_BTNS = [
  { id: "search",        label: "Buscar",       Icon: Search          },
  { id: "filter",        label: "Filtrar",      Icon: SlidersHorizontal },
  { id: "notifications", label: "Notificações", Icon: Bell            },
  { id: "favorite",      label: "Favoritar",    Icon: Star            },
  { id: "more",          label: "Mais",         Icon: MoreHorizontal  },
];

interface Props {
  activeTab: ProjectTabKey;
  onTabChange: (tab: ProjectTabKey) => void;
  projectCount: number;
}

export function ProjectHeader({ activeTab, onTabChange, projectCount }: Readonly<Props>) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: TEAMS.white,
      borderBottom: `1px solid ${TEAMS.border}`,
      padding: "0 24px",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0 0", fontSize: 12 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "transparent", border: "none", cursor: "pointer",
            color: TEAMS.purple, fontSize: 12,
            fontFamily: "'Segoe UI', sans-serif", padding: 0,
          }}
        >
          <ChevronLeft size={14} /> Início
        </button>
        <span style={{ color: TEAMS.border }}>/</span>
        <span style={{ color: TEAMS.textSecondary }}>Projetos</span>
      </div>

      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: "linear-gradient(135deg, #6264A7, #8764B8)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <FolderKanban size={20} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1.2 }}>
              Projetos
            </div>
            <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>
              {projectCount} {projectCount === 1 ? "projeto" : "projetos"} no total
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {ACTION_BTNS.map(({ id, label, Icon }) => (
            <button
              key={id}
              title={label}
              style={{
                display: "flex", alignItems: "center",
                background: "transparent", border: "none", cursor: "pointer",
                color: TEAMS.textSecondary, padding: "6px 10px",
                borderRadius: 4, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F3F2F1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginTop: 8 }}>
        {PROJECT_TABS.map((t) => (
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
            onMouseEnter={(e) => { if (activeTab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textPrimary; }}
            onMouseLeave={(e) => { if (activeTab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textSecondary; }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}