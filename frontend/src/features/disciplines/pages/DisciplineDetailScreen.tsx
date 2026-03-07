// src/features/disciplines/pages/DisciplineDetailScreen.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarSimple } from "../../../components/sidebar-simple";
import type { Discipline } from "../services/disciplinesService";
import { getDiscipline } from "../services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";
import { TEAMS } from "../constants/teamsTheme";
import { DisciplineHeader } from "../components/DisciplineHeader";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { MaterialsTab } from "../components/tabs/MaterialsTab";
import { ChatTab } from "../components/tabs/ChatTab";
import { SettingsTab } from "../components/tabs/SettingsTab";

function getLoggedUserName(): string {
  return localStorage.getItem("user_nome") ?? "";
}

export default function DisciplineDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const currentUserName = getLoggedUserName();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDiscipline(Number(id))
      .then((d) => {
        setDiscipline(d);
        document.title = d.name + " - Disciplina";
      })
      .catch((err: Error) => setError(err.message || "Erro ao carregar disciplina."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <SidebarSimple />

      <div style={{ flex: 1, background: TEAMS.bg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textSecondary, fontSize: 14 }}>
            Carregando...
          </div>
        )}

        {error && (
          <div style={{ margin: 24, padding: "12px 16px", background: "#FEF0F1", border: "1px solid #F3D1D3", borderRadius: 8, color: "#A4262C", fontSize: 14 }}>
            {error}
          </div>
        )}

        {discipline && (
          <>
            <DisciplineHeader
              discipline={discipline}
              activeTab={tab}
              onTabChange={setTab}
            />

            <div style={{ flex: 1, padding: 24 }}>
              <AnimatePresence mode="wait">
                {tab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <OverviewTab discipline={discipline} />
                  </motion.div>
                )}
                {tab === "materials" && (
                  <motion.div key="materials" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <MaterialsTab disciplineId={discipline.id} />
                  </motion.div>
                )}
                {tab === "chat" && (
                  <motion.div key="chat" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <ChatTab disciplineId={discipline.id} currentUserName={currentUserName} />
                  </motion.div>
                )}
                {tab === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <SettingsTab discipline={discipline} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}