// src/features/disciplines/pages/DisciplineScreen.tsx

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Toaster, toast } from "sonner";
import {
  Search, Plus, X, 
  Hash, User, BookMarked, Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { createDiscipline, listDisciplines, removeDiscipline, updateDiscipline, type Discipline, type Pagination,
} from "../services/disciplinesService";
import { FormField } from "../components/forms/FormField";
import { PaginationBar } from "../components/pagination/PaginationBar";
import { ConfirmDeleteDialog } from "../components/pagination/ConfirmDeleteDialog";
import { DisciplineCard } from "../components/pagination/DisciplineCard";


// ─── Schema ────────────────────────────────────────────────────────────────
const disciplineSchema = z.object({
  name:      z.string().min(3, "Mínimo 3 caracteres.").max(100).trim(),
  code:      z.string().min(2, "Mínimo 2 caracteres.").max(20).regex(/^[A-Za-z0-9]+$/, "Apenas letras e números, sem espaços.").trim(),
  professor: z.string().min(3, "Mínimo 3 caracteres.").max(100).trim(),
});
type DisciplineForm = z.infer<typeof disciplineSchema>;

export default function DisciplineScreen() {
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
  const navigate = useNavigate();

  const pluralSuffix = pagination?.totalItems === 1 ? "" : "s";
  const headerCount = pagination
    ? `${pagination.totalItems} disciplina${pluralSuffix} cadastrada${pluralSuffix}`
    : "Carregando...";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DisciplineForm>({
    resolver: zodResolver(disciplineSchema),
  });

  let modalButtonText = "Adicionar";
  if (isSubmitting) modalButtonText = "Salvando...";
  else if (editingDiscipline) modalButtonText = "Salvar alterações";

  const loadDisciplines = async (page: number) => {
    try {
      setLoading(true);
      const res = await listDisciplines(page);
      setDisciplines(res.data);
      setPagination(res.pagination);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao buscar disciplinas.");
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

  const openCreate = () => {
    setEditingDiscipline(null);
    reset({ name: "", code: "", professor: "" });
    setIsModalOpen(true);
  };

  const openEdit = (d: Discipline) => {
    setEditingDiscipline(d);
    reset({ name: d.name, code: d.code, professor: d.professor });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiscipline(null);
    reset();
  };

  const onSubmit = async (data: DisciplineForm) => {
    try {
      if (editingDiscipline) {
        const updated = await updateDiscipline(editingDiscipline.id, data);
        setDisciplines((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        toast.success("Disciplina atualizada!");
      } else {
        const created = await createDiscipline(data);
        setDisciplines((prev) => [created, ...prev]);
        setPagination((prev) => prev ? { ...prev, totalItems: prev.totalItems + 1 } : prev);
        toast.success("Disciplina criada!");
      }
      closeModal();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeDiscipline(deleteTarget.id);
      setDisciplines((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setPagination((prev) => prev ? { ...prev, totalItems: prev.totalItems - 1 } : prev);
      toast.success("Disciplina excluída.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fc] font-sans overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed left-0 top-0 h-full z-40 lg:hidden">
              <SidebarSimple />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <div className="hidden lg:block"><SidebarSimple /></div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 bg-[#f4f7fc]/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-800 text-base">Disciplinas</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="hidden lg:block text-2xl font-bold text-slate-800 mb-1">Disciplinas</h1>
              <p className="text-sm text-slate-500">{headerCount}</p>
            </div>
            <div className="flex gap-2.5">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar disciplina..."
                  className="pl-9 pr-4 py-2.5 w-full sm:w-64 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition"
                />
              </div>
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Disciplina</span><span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <BookMarked className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-lg">Nenhuma disciplina encontrada</p>
                <p className="text-slate-400 text-sm mt-1">{searchTerm ? "Tente outro termo de busca." : "Crie sua primeira disciplina."}</p>
              </div>
              {!searchTerm && (
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Nova Disciplina
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map((d, i) => (
                  <DisciplineCard
                    key={d.id}
                    discipline={d}
                    index={i}
                    onEdit={openEdit}
                    onDelete={(disc) => setDeleteTarget(disc)}
                    onClick={() => navigate(`/disciplinas/${d.id}`)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}

          {pagination && <PaginationBar pagination={pagination} onPageChange={setCurrentPage} />}
        </div>
      </main>

      {/* Create / Edit Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content asChild>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-lg font-bold text-slate-800">
                  {editingDiscipline ? "Editar disciplina" : "Nova disciplina"}
                </Dialog.Title>
                <button onClick={closeModal} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField icon={BookMarked} label="Nome"      id="name"      placeholder="Ex: Cálculo I"        error={errors.name?.message}      registration={register("name")} />
                <FormField icon={Hash}       label="Código"    id="code"      placeholder="Ex: MAT101"           error={errors.code?.message}      registration={register("code")} />
                <FormField icon={User}       label="Professor" id="professor" placeholder="Ex: Dr. João Silva"   error={errors.professor?.message} registration={register("professor")} />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    {modalButtonText}
                  </button>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirm */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        disciplineName={deleteTarget?.name ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}