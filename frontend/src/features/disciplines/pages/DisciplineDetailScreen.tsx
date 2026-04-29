import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { DisciplineHeader } from "../components/DisciplineHeader";
import { TaskTab } from "../components/tasks/TaskTab";
import { ChatTab } from "../components/tabs/ChatTab";
import { MaterialsTab } from "../components/tabs/MaterialsTab";
import { MeetingTab } from "../components/tabs/MeetingTab";
import { MembersTab } from "../components/tabs/MembersTab";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { SettingsTab } from "../components/tabs/SettingsTab";
import { getDiscipline } from "../services/disciplinesService";
import type { Discipline } from "../services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";

function getLoggedUserName(): string {
  return localStorage.getItem("user_nome") ?? "";
}

function getLoggedUserEmail(): string {
  return localStorage.getItem("user_email") ?? "";
}

export default function DisciplineDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserEmail = getLoggedUserEmail();
  const currentUserName = getLoggedUserName();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const userRole =
    (localStorage.getItem("user_role") as "professor" | "student") || "student";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDiscipline(Number(id))
      .then((d) => {
        setDiscipline(d);
        document.title = `${d.name} - Disciplina`;
      })
      .catch((err: Error) => setError(err.message || "Erro ao carregar disciplina."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="app-page flex h-dvh overflow-hidden font-sans">
      <SidebarSimple />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {loading && (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--app-text-muted)]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-accent)] border-t-transparent" />
              <span>Carregando disciplina...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="m-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="h-2 w-2 rounded-full bg-red-500" />
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
              <div className="mx-auto max-w-7xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {tab === "overview" && <OverviewTab discipline={discipline} />}
                    {tab === "posts" && <OverviewTab discipline={discipline} />}
                    {tab === "materials" && <MaterialsTab disciplineId={discipline.id} />}
                    {tab === "chat" && (
                      <ChatTab
                        disciplineId={discipline.id}
                        currentUserName={currentUserName}
                      />
                    )}
                    {tab === "tasks" && (
                      <TaskTab discipline={discipline} userRole={userRole} />
                    )}
                    {tab === "meeting" && (
                      <MeetingTab
                        discipline={discipline}
                        currentUserEmail={currentUserEmail}
                        currentUserName={currentUserName}
                      />
                    )}
                    {tab === "members" && <MembersTab disciplineId={discipline.id} />}
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
