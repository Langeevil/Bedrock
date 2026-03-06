// components/DisciplineHeader.tsx

import { BookMarked, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Discipline } from "../../../features/disciplines/services/disciplinesService";

const COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-700" },
  { bg: "from-blue-500 to-cyan-600", light: "bg-blue-50", text: "text-blue-700" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-700" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-700" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-700" },
  { bg: "from-indigo-500 to-blue-600", light: "bg-indigo-50", text: "text-indigo-700" },
];

function getColor(id: number) {
  return COLORS[id % COLORS.length];
}

interface Props {
  discipline: Discipline;
}

export function DisciplineHeader({ discipline }: Readonly<Props>) {
  const navigate = useNavigate();
  const color = getColor(discipline.id);

  const initials = discipline.professor
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white border-b border-slate-100 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Back */}
        <button
          onClick={() => navigate("/disciplinas")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Disciplinas
        </button>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <span
            className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${color.bg} text-white text-xl sm:text-2xl font-bold shadow-md shrink-0`}
          >
            {initials}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight truncate">
                {discipline.name}
              </h1>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${color.light} ${color.text} border border-current/20 shrink-0`}
              >
                {discipline.code}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" />
              {discipline.professor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}