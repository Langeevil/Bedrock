// components/tabs/OverviewTab.tsx

import { BookOpen, FileText, FolderOpen, MessageSquare, Users } from "lucide-react";
import type { Discipline } from "../../../disciplines/services/disciplinesService";

interface Props {
  discipline: Discipline;
  postCount?: number;
  fileCount?: number;
  memberCount?: number;
  onNavigate: (tab: "posts" | "materials" | "chat" | "members") => void;
}

const COLORS = [
  { bg: "from-violet-500 to-purple-600" },
  { bg: "from-blue-500 to-cyan-600" },
  { bg: "from-emerald-500 to-teal-600" },
  { bg: "from-rose-500 to-pink-600" },
  { bg: "from-amber-500 to-orange-600" },
  { bg: "from-indigo-500 to-blue-600" },
];

export function OverviewTab({ discipline, postCount = 0, fileCount = 0, memberCount = 0, onNavigate }: Readonly<Props>) {
  const colorBg = COLORS[discipline.id % COLORS.length].bg;

  const stats = [
    { icon: FileText, label: "Posts", value: postCount, tab: "posts" as const, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: FolderOpen, label: "Materiais", value: fileCount, tab: "materials" as const, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Users, label: "Membros", value: memberCount, tab: "members" as const, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className={`rounded-2xl bg-gradient-to-br ${colorBg} p-6 text-white shadow-md`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">{discipline.code}</p>
            <h2 className="text-xl font-bold leading-tight">{discipline.name}</h2>
          </div>
        </div>
        <p className="text-white/80 text-sm">Prof. {discipline.professor}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, label, value, tab, color, bg }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center group"
          >
            <div className={`p-2 rounded-xl ${bg} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Ações rápidas</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigate("chat")}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
              <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Abrir chat da turma</p>
              <p className="text-xs text-slate-400">Converse com colegas em tempo real</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("materials")}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
              <FolderOpen className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Ver materiais</p>
              <p className="text-xs text-slate-400">Acesse arquivos e documentos da disciplina</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}