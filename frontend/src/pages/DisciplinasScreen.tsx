// src/pages/DisciplinasScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster, toast } from "sonner";
import {
  Search, Plus, BookOpen, X, Pencil, Trash2,
  GraduationCap, Hash, User, BookMarked,
  ChevronLeft, ChevronRight, AlertCircle, Menu,
} from "lucide-react";
import { SidebarSimple } from "../components/sidebar-simple";
import {
  createDiscipline,
  listDisciplines,
  removeDiscipline,
  updateDiscipline,
  type Discipline,
  type Pagination,
} from "../services/disciplinesService";

// ─── Schema ───────────────────────────────────────────────────────────────────
const disciplineSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres.").max(100, "Máximo 100 caracteres.").trim(),
  code: z.string().min(2, "Mínimo 2 caracteres.").max(20, "Máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9]+$/, "Apenas letras e números, sem espaços.").trim(),
  professor: z.string().min(3, "Mínimo 3 caracteres.").max(100, "Máximo 100 caracteres.").trim(),
});
type DisciplineForm = z.infer<typeof disciplineSchema>;

// ─── Paleta ───────────────────────────────────────────────────────────────────
const COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { bg: "from-blue-500 to-cyan-600",     light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  { bg: "from-emerald-500 to-teal-600",  light: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200"},
  { bg: "from-rose-500 to-pink-600",     light: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
  { bg: "from-amber-500 to-orange-600",  light: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  { bg: "from-indigo-500 to-blue-600",   light: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
];
function getColor(id: number) { return COLORS[id % COLORS.length]; }

// ─── Avatar ───────────────────────────────────────────────────────────────────
function ProfessorAvatar({ name }: Readonly<{ name: string }>) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold shrink-0">
      {initials}
    </span>
  );
}

// ─── Campo com erro ───────────────────────────────────────────────────────────
function FormField({ icon: Icon, label, id, placeholder, error, registration }: Readonly<{
  icon: React.ElementType; label: string; id: string;
  placeholder: string; error?: string; registration: object;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />{label}
      </label>
      <input
        id={id} type="text" placeholder={placeholder} {...registration}
        className={`w-full px-3 py-2.5 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition ${
          error ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-slate-200 focus:ring-blue-400"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Paginação ────────────────────────────────────────────────────────────────
function PaginationBar({ pagination, onPageChange }: Readonly<{
  pagination: Pagination; onPageChange: (page: number) => void;
}>) {
  const { page, totalPages, totalItems, hasPrevPage, hasNextPage } = pagination;
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 px-1">
      <p className="text-sm text-slate-400 order-2 sm:order-1">
        {totalItems} disciplina{totalItems === 1 ? "" : "s"} no total
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page ? "bg-blue-500 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNextPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDeleteDialog({ open, onConfirm, onCancel, disciplineName }: Readonly<{
  open: boolean; onConfirm: () => void; onCancel: () => void; disciplineName: string;
}>) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <AlertDialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6"
          >
            <AlertDialog.Title className="font-bold text-slate-800 text-lg mb-2">Excluir disciplina?</AlertDialog.Title>
            <AlertDialog.Description className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja excluir <span className="font-semibold text-slate-700">"{disciplineName}"</span>? Essa ação não pode ser desfeita.
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm">Sim, excluir</button>
              </AlertDialog.Action>
            </div>
          </motion.div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function DisciplineCard({ discipline, index, onEdit, onDelete }: Readonly<{
  discipline: Discipline; index: number;
  onEdit: (d: Discipline) => void; onDelete: (d: Discipline) => void;
}>) {
  const color = getColor(discipline.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${color.bg}`} />
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-xl ${color.light}`}>
            <BookOpen className={`w-5 h-5 ${color.text}`} />
          </div>
          <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${color.light} ${color.text} border ${color.border}`}>
            {discipline.code}
          </span>
        </div>
        <h3 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2">{discipline.name}</h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <ProfessorAvatar name={discipline.professor} />
            <span className="text-sm text-slate-500 truncate">{discipline.professor}</span>
          </div>
          {/* Botões sempre visíveis no mobile, hover no desktop */}
          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={() => onEdit(discipline)}
                    className="p-1.5 rounded-lg bg-slate-50 sm:bg-white border border-slate-200 shadow-sm hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>Editar</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={() => onDelete(discipline)}
                    className="p-1.5 rounded-lg bg-slate-50 sm:bg-white border border-slate-200 shadow-sm hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>Excluir</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function DisciplinesScreen() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Discipline | null>(null);

  // prepare derived strings for rendering
  const pluralSuffix = pagination?.totalItems === 1 ? "" : "s";
  const headerCount = pagination
    ? `${pagination.totalItems} disciplina${pluralSuffix} cadastrada${pluralSuffix}`
    : "Carregando...";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DisciplineForm>({
    resolver: zodResolver(disciplineSchema),
  });

  // button text for modal is derived from submission / editing state
  let modalButtonText = "Adicionar";
  if (isSubmitting) {
    modalButtonText = "Salvando...";
  } else if (editingDiscipline) {
    modalButtonText = "Salvar alterações";
  }

  const loadDisciplines = async (page: number) => {
    try {
      setLoading(true);
      const res = await listDisciplines(page);
      setDisciplines(res.data);
      setPagination(res.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar disciplinas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Disciplinas - Bedrock";
    loadDisciplines(currentPage);
  }, [currentPage]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    if (!t) return disciplines;
    return disciplines.filter(
      (d) => d.name.toLowerCase().includes(t) || d.code.toLowerCase().includes(t) || d.professor.toLowerCase().includes(t)
    );
  }, [disciplines, searchTerm]);

  const openAdd = () => { setEditingDiscipline(null); reset({ name: "", code: "", professor: "" }); setIsModalOpen(true); };
  const openEdit = (d: Discipline) => { setEditingDiscipline(d); reset({ name: d.name, code: d.code, professor: d.professor }); setIsModalOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await removeDiscipline(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" excluída com sucesso.`);
      loadDisciplines(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const onSubmit = async (data: DisciplineForm) => {
    try {
      if (editingDiscipline) {
        await updateDiscipline(editingDiscipline.id, data);
        toast.success("Disciplina atualizada com sucesso!");
      } else {
        await createDiscipline(data);
        toast.success("Disciplina criada com sucesso!");
      }
      setIsModalOpen(false);
      loadDisciplines(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar disciplina.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fc] font-sans overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar mobile — overlay */}
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

      {/* Sidebar desktop — sempre visível */}
      <div className="hidden lg:block">
        <SidebarSimple />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header mobile com botão menu */}
        <div className="sticky top-0 z-20 bg-[#f4f7fc]/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-500" />
            Disciplinas
          </h1>
          <button
            onClick={openAdd}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold text-xs shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova
          </button>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header desktop */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                  <BookMarked className="w-6 h-6 text-white" />
                </div>
                Disciplinas
              </h1>
              <p className="text-slate-400 text-sm mt-1 ml-14">
                {headerCount}
              </p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95">
              <Plus className="w-4 h-4" />Nova Disciplina
            </button>
          </div>

          {/* Busca */}
          <div className="relative mb-6 lg:mb-8 w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar disciplinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition"
            />
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <X className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 lg:py-24 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-100">
                <GraduationCap className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {searchTerm ? "Nenhuma disciplina encontrada." : "Nenhuma disciplina cadastrada ainda."}
              </p>
              {!searchTerm && (
                <button onClick={openAdd} className="text-blue-600 font-semibold text-sm hover:underline">
                  Adicionar primeira disciplina →
                </button>
              )}
            </motion.div>
          )}

          {/* Grid — 1 col mobile, 2 tablet, 3 desktop, 4 wide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            <AnimatePresence>
              {filtered.map((d, i) => (
                <DisciplineCard key={d.id} discipline={d} index={i} onEdit={openEdit} onDelete={setDeleteTarget} />
              ))}
            </AnimatePresence>
          </div>

          {pagination && !searchTerm && (
            <PaginationBar pagination={pagination} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          )}
        </div>
      </main>

      {/* Modal — ocupa tela inteira no mobile */}
      <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-md"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Handle visual no mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-100">
                <Dialog.Title className="font-bold text-slate-800 text-lg">
                  {editingDiscipline ? "Editar Disciplina" : "Nova Disciplina"}
                </Dialog.Title>
                <Dialog.Close className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
                <FormField icon={BookOpen} label="Nome" id="discipline-name" placeholder="Ex: Cálculo I" error={errors.name?.message} registration={register("name")} />
                <FormField icon={Hash} label="Código" id="discipline-code" placeholder="Ex: MAT101" error={errors.code?.message} registration={register("code")} />
                <FormField icon={User} label="Professor" id="discipline-professor" placeholder="Ex: Dr. João Silva" error={errors.professor?.message} registration={register("professor")} />

                <div className="flex gap-3 pt-2 pb-safe">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 px-4 py-3 sm:py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                        Salvando...
                      </span>
                    ) : modalButtonText}
                  </button>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        disciplineName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}