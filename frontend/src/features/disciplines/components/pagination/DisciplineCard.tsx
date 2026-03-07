import * as Tooltip from "@radix-ui/react-tooltip";
import { BookOpen, Pencil, Trash2} from "lucide-react";
import { type Discipline } from "../../services/disciplinesService";
import { getColor } from "../../constants/disciplineColors";
import { ProfessorAvatar } from "../ProfessorAvatar";
import { motion } from "framer-motion";

export function DisciplineCard({ discipline, index, onEdit, onDelete, onClick }: Readonly<{
  discipline: Discipline; index: number; onEdit: (d: Discipline) => void; onDelete: (d: Discipline) => void; onClick?: () => void;
}>) {
  const color = getColor(discipline.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col min-h-[280px] cursor-pointer"
      {...(onClick ? { role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } } : {})}
    >
      <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-xl ${color.light}`}><BookOpen className={`w-5 h-5 ${color.text}`} /></div>
          <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${color.light} ${color.text} border ${color.border}`}>{discipline.code}</span>
        </div>
        <div className="flex items-center justify-center gap-4 flex-1">
          <ProfessorAvatar name={discipline.professor} colorBg={color.bg} />
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 text-2xl leading-tight">{discipline.name}</h3>
            <span className="text-sm text-slate-500 mt-1">{discipline.professor}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(discipline); }} className="p-1.5 rounded-lg bg-slate-50 sm:bg-white border border-slate-200 shadow-sm hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>Editar</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(discipline); }} className="p-1.5 rounded-lg bg-slate-50 sm:bg-white border border-slate-200 shadow-sm hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>Excluir</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </motion.div>
  );
}