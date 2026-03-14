// src/features/disciplines/pages/DisciplineDetailScreen.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarSimple } from "../../../components/sidebar-simple";
import type { Discipline } from "../services/disciplinesService";
import { getDiscipline } from "../services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";
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
    <div className="flex h-screen bg-[#F5F5F5] font-sans overflow-hidden">
      <SidebarSimple />

      <div className="flex-1 flex flex-col overflow-hidden">
        {loading && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Carregando disciplina...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
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

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {tab === "overview" && <OverviewTab discipline={discipline} />}

                    {/* MENU DE MATERIAS/ARQUIVOS */}
                    {tab === "materials" && <MaterialsTab disciplineId={discipline.id} />}
                    
                    {tab === "chat" && (
                      <ChatTab disciplineId={discipline.id} currentUserName={currentUserName} />
                    )}
                    {tab === "settings" && <SettingsTab discipline={discipline} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}