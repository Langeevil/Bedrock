// pages/DisciplineScreen.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Menu } from "lucide-react";
import { SidebarSimple } from "../../../../src/components/sidebar-simple";
import { usePosts } from "../hooks/usePosts";
import { useFiles } from "../hooks/useFiles";
import { DisciplineHeader } from "../components/DisciplineHeader";
import { DisciplineTabs } from "../components/DisciplineTabs";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { PostsTab } from "../components/tabs/PostsTab";
import { MaterialsTab } from "../components/tabs/MaterialsTab";
import { ChatTab } from "../components/tabs/ChatTab";
import { MembersTab } from "../components/tabs/MembersTab";
import { SettingsTab } from "../components/tabs/SettingsTab";
import type { Discipline } from "../../../features/disciplines/services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";
import { getDiscipline } from "../../../features/disciplines/services/disciplinesService";

export default function DisciplineScreen() {
  const { id } = useParams<{ id: string }>();
  const disciplineId = Number(id);

  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { posts } = usePosts(disciplineId);
  const { files } = useFiles(disciplineId);

  useEffect(() => {
    if (!disciplineId) return;
    document.title = "Disciplina - Bedrock";
    setLoading(true);
    getDiscipline(disciplineId)
      .then((d) => {
        setDiscipline(d as Discipline);
        document.title = `${d.name} - Bedrock`;
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [disciplineId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fc]">
        <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !discipline) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fc]">
        <p className="text-slate-500 font-medium">{error ?? "Disciplina não encontrada."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f7fc] font-sans overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full z-40 lg:hidden"
            >
              <SidebarSimple />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <SidebarSimple />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 bg-[#f4f7fc]/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-800 text-base truncate">{discipline.name}</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <DisciplineHeader discipline={discipline} />
          <DisciplineTabs active={activeTab} onChange={setActiveTab} />

          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    discipline={discipline}
                    postCount={posts.length}
                    fileCount={files.length}
                    memberCount={4}
                    onNavigate={setActiveTab}
                  />
                )}
                {activeTab === "posts" && <PostsTab disciplineId={disciplineId} />}
                {activeTab === "materials" && <MaterialsTab disciplineId={disciplineId} />}
                {activeTab === "chat" && <ChatTab disciplineId={disciplineId} />}
                {activeTab === "members" && <MembersTab />}
                {activeTab === "settings" && (
                  <SettingsTab discipline={discipline} onUpdated={setDiscipline} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}