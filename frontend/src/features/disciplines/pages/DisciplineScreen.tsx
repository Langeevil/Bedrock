import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Toaster, toast } from "sonner";
import {
  Search,
  Plus,
  X,
  Hash,
  User,
  BookMarked,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarSimple } from "../../../components/sidebar-simple";
import {
  createDiscipline,
  listDisciplines,
  removeDiscipline,
  updateDiscipline,
  type Discipline,
  type Pagination,
} from "../services/disciplinesService";
import { FormField } from "../components/forms/FormField";
import { PaginationBar } from "../components/pagination/PaginationBar";
import { ConfirmDeleteDialog } from "../components/pagination/ConfirmDeleteDialog";
import { DisciplineCard } from "../components/pagination/DisciplineCard";

const disciplineSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres.").max(100).trim(),
  code: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, "Apenas letras e números, sem espaços.")
    .trim(),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisciplineForm>({
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
    const term = searchTerm.toLowerCase();
    if (!term) return disciplines;

    return disciplines.filter(
      (discipline) =>
        discipline.name.toLowerCase().includes(term) ||
        discipline.code.toLowerCase().includes(term) ||
        discipline.professor.toLowerCase().includes(term)
    );
  }, [disciplines, searchTerm]);

  const openCreate = () => {
    setEditingDiscipline(null);
    reset({ name: "", code: "", professor: "" });
    setIsModalOpen(true);
  };

  const openEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    reset({
      name: discipline.name,
      code: discipline.code,
      professor: discipline.professor,
    });
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
        setDisciplines((prev) =>
          prev.map((discipline) =>
            discipline.id === updated.id ? updated : discipline
          )
        );
        toast.success("Disciplina atualizada!");
      } else {
        const created = await createDiscipline(data);
        setDisciplines((prev) => [created, ...prev]);
        setPagination((prev) =>
          prev ? { ...prev, totalItems: prev.totalItems + 1 } : prev
        );
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
      setDisciplines((prev) =>
        prev.filter((discipline) => discipline.id !== deleteTarget.id)
      );
      setPagination((prev) =>
        prev ? { ...prev, totalItems: prev.totalItems - 1 } : prev
      );
      toast.success("Disciplina excluída.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app-page flex h-dvh overflow-hidden font-sans">
      <Toaster position="top-right" richColors closeButton />

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-40 h-full lg:hidden"
            >
              <SidebarSimple />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block">
        <SidebarSimple />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--app-border)] bg-[color:var(--app-bg)]/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-slate-800">Disciplinas</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center lg:mb-8">
            <div>
              <h1 className="mb-1 hidden text-2xl font-bold text-slate-800 lg:block">
                Disciplinas
              </h1>
              <p className="text-sm text-slate-500">{headerCount}</p>
            </div>

            <div className="flex gap-2.5">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Buscar disciplina"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar disciplina..."
                  className="app-input w-full rounded-xl border py-2.5 pl-9 pr-4 text-base shadow-sm transition placeholder:text-[var(--app-text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-64"
                />
              </div>
              <button
                onClick={openCreate}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Disciplina</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <BookMarked className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  Nenhuma disciplina encontrada
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {searchTerm
                    ? "Tente outro termo de busca."
                    : "Crie sua primeira disciplina."}
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  Nova Disciplina
                </button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <AnimatePresence>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {filtered.map((discipline, index) => (
                  <DisciplineCard
                    key={discipline.id}
                    discipline={discipline}
                    index={index}
                    onEdit={openEdit}
                    onDelete={(target) => setDeleteTarget(target)}
                    onClick={() => navigate(`/disciplinas/${discipline.id}`)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}

          {pagination && (
            <PaginationBar pagination={pagination} onPageChange={setCurrentPage} />
          )}
        </div>
      </main>

      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:p-7"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <Dialog.Title className="text-lg font-bold text-slate-800">
                  {editingDiscipline ? "Editar disciplina" : "Nova disciplina"}
                </Dialog.Title>
                <button
                  type="button"
                  aria-label="Fechar formulario de disciplina"
                  onClick={closeModal}
                  className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  icon={BookMarked}
                  label="Nome"
                  id="name"
                  placeholder="Ex: Cálculo I"
                  error={errors.name?.message}
                  registration={register("name")}
                />
                <FormField
                  icon={Hash}
                  label="Código"
                  id="code"
                  placeholder="Ex: MAT101"
                  error={errors.code?.message}
                  registration={register("code")}
                />
                <FormField
                  icon={User}
                  label="Professor"
                  id="professor"
                  placeholder="Ex: Dr. João Silva"
                  error={errors.professor?.message}
                  registration={register("professor")}
                />
                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {modalButtonText}
                  </button>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        disciplineName={deleteTarget?.name ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
