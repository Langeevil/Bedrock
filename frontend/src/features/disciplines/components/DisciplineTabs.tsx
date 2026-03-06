// components/DisciplineTabs.tsx

import { LayoutDashboard, FileText, FolderOpen, MessageSquare, Users, Settings } from "lucide-react";
import type { TabKey } from "../types/disciplineTypes";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "materials", label: "Materiais", icon: FolderOpen },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "members", label: "Membros", icon: Users },
  { key: "settings", label: "Config.", icon: Settings },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function DisciplineTabs({ active, onChange }: Readonly<Props>) {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}