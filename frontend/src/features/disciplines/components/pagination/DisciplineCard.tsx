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
      className="group relative flex min-h-72 w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--app-accent)_45%,var(--app-border))] hover:shadow-xl"
      {...(onClick ? { role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } } : {})}
    >
      <div className="flex h-full flex-col justify-between p-6">
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
            <h3 className="px-2 text-xl font-bold leading-tight text-[var(--app-text)]">
              {discipline.name}
            </h3>
            <span className="text-sm font-medium text-[var(--app-text-muted)]">
              {discipline.professor}
            </span>
          </div>
        </div>

        {/* Rodapé: Ações */}
        <div className="flex items-center justify-between border-t border-[var(--app-border)] pt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Detalhes</span>
          <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button type="button" aria-label={`Editar disciplina ${discipline.name}`} onClick={(e) => { e.stopPropagation(); onEdit(discipline); }} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-2 text-[var(--app-text-muted)] shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal><Tooltip.Content className="text-xs bg-slate-900 text-white px-2 py-1 rounded-none" sideOffset={5}>Editar</Tooltip.Content></Tooltip.Portal>
              </Tooltip.Root>
              
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button type="button" aria-label={`Excluir disciplina ${discipline.name}`} onClick={(e) => { e.stopPropagation(); onDelete(discipline); }} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-2 text-[var(--app-text-muted)] shadow-sm transition-colors hover:border-red-300 hover:text-red-600">
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
