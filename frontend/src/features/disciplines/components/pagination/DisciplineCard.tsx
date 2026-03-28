import * as Tooltip from "@radix-ui/react-tooltip";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      // Tamanho maior (w-72 h-72) e bordas totalmente retas (rounded-none)
      className="group relative bg-white rounded-none border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col w-72 h-72 cursor-pointer"
      {...(onClick ? { role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } } : {})}
    >
      <div className="p-6 flex flex-col h-full justify-between">
        {/* Topo: Ícone e Código */}
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-none ${color.light}`}>
            <BookOpen className={`w-5 h-5 ${color.text}`} />
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-none ${color.light} ${color.text} border ${color.border}`}>
            {discipline.code}
          </span>
        </div>

        {/* Centro: Conteúdo em destaque */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
             <ProfessorAvatar name={discipline.professor} colorBg={color.bg} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-slate-800 text-xl leading-tight px-2">
              {discipline.name}
            </h3>
            <span className="text-sm text-slate-400 font-medium">
              {discipline.professor}
            </span>
          </div>
        </div>

        {/* Rodapé: Ações */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Detalhes</span>
          <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(discipline); }} className="p-2 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="text-xs bg-slate-900 text-white px-2 py-1 rounded-none" sideOffset={5}>Editar</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
              
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(discipline); }} className="p-2 rounded-none bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="text-xs bg-slate-900 text-white px-2 py-1 rounded-none" sideOffset={5}>Excluir</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </motion.div>
  );
}