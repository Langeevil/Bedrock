// DisciplinesScreen.tsx
// Dependências necessárias:
// npm install lucide-react framer-motion @radix-ui/react-dialog @radix-ui/react-tooltip
// npx shadcn@latest add card dialog input button badge

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Search,
  Plus,
  BookOpen,
  X,
  Pencil,
  Trash2,
  GraduationCap,
  Hash,
  User,
  BookMarked,
} from "lucide-react";
import { SidebarSimple } from "../components/sidebar-simple";
import {
  createDiscipline,
  listDisciplines,
  removeDiscipline,
  updateDiscipline,
  type Discipline,
} from "../services/disciplinesService";

// ─── Paleta ──────────────────────────────────────────────────────────────────
const COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { bg: "from-blue-500 to-cyan-600",     light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  { bg: "from-emerald-500 to-teal-600",  light: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200"},
  { bg: "from-rose-500 to-pink-600",     light: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
  { bg: "from-amber-500 to-orange-600",  light: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  { bg: "from-indigo-500 to-blue-600",   light: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
];

function getColor(id: number) {
  return COLORS[id % COLORS.length];
}

// ─── Avatar do professor ──────────────────────────────────────────────────────
function ProfessorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold shrink-0">
      {initials}
    </span>
  );
}

// ─── Card de Disciplina ───────────────────────────────────────────────────────
function DisciplineCard({
  discipline,
  index,
  onEdit,
  onDelete,
}: {
  discipline: Discipline;
  index: number;
  onEdit: (d: Discipline) => void;
  onDelete: (id: number) => void;
}) {
  const color = getColor(discipline.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Faixa colorida no topo */}
      <div className={`h-2 w-full bg-gradient-to-r ${color.bg}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Ícone + código */}
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-xl ${color.light}`}>
            <BookOpen className={`w-5 h-5 ${color.text}`} />
          </div>
          <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${color.light} ${color.text} border ${color.border}`}>
            {discipline.code}
          </span>
        </div>

        {/* Nome */}
        <h3 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2">
          {discipline.name}
        </h3>

        {/* Professor */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
          <ProfessorAvatar name={discipline.professor} />
          <span className="text-sm text-slate-500 truncate">{discipline.professor}</span>
        </div>
      </div>

      {/* Ações — aparecem no hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => onEdit(discipline)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>
                Editar
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => onDelete(discipline.id)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md" sideOffset={4}>
                Excluir
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </motion.div>
  );
}

// ─── Campo do formulário ──────────────────────────────────────────────────────
function FormField({
  icon: Icon,
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType;
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
      />
    </div>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function DisciplinesScreen() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", professor: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Disciplinas - Bedrock";
    listDisciplines()
      .then((data) => { setDisciplines(data); setError(null); })
      .catch((err) => setError(err.message || "Erro ao buscar disciplinas."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return disciplines.filter(
      (d) =>
        d.name.toLowerCase().includes(t) ||
        d.code.toLowerCase().includes(t) ||
        d.professor.toLowerCase().includes(t)
    );
  }, [disciplines, searchTerm]);

  const openAdd = () => {
    setEditingDiscipline(null);
    setFormData({ name: "", code: "", professor: "" });
    setIsModalOpen(true);
  };

  const openEdit = (d: Discipline) => {
    setEditingDiscipline(d);
    setFormData({ name: d.name, code: d.code, professor: d.professor });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta disciplina?")) return;
    try {
      await removeDiscipline(id);
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      professor: formData.professor.trim(),
    };
    try {
      if (editingDiscipline) {
        const updated = await updateDiscipline(editingDiscipline.id, payload);
        setDisciplines((prev) => prev.map((d) => (d.id === editingDiscipline.id ? updated : d)));
      } else {
        const created = await createDiscipline(payload);
        setDisciplines((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar.");
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fc] font-sans">
      <SidebarSimple />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              Disciplinas
            </h1>
            <p className="text-slate-400 text-sm mt-1 ml-14">
              {disciplines.length} disciplina{disciplines.length !== 1 ? "s" : ""} cadastrada{disciplines.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nova Disciplina
          </button>
        </div>

        {/* Busca */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent shadow-sm transition"
          />
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="p-5 rounded-2xl bg-slate-100">
              <GraduationCap className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              {searchTerm ? "Nenhuma disciplina encontrada." : "Nenhuma disciplina cadastrada ainda."}
            </p>
            {!searchTerm && (
              <button
                onClick={openAdd}
                className="text-violet-600 font-semibold text-sm hover:underline"
              >
                Adicionar primeira disciplina →
              </button>
            )}
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filtered.map((d, i) => (
              <DisciplineCard
                key={d.id}
                discipline={d}
                index={i}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <Dialog.Title className="font-bold text-slate-800 text-lg">
                  {editingDiscipline ? "Editar Disciplina" : "Nova Disciplina"}
                </Dialog.Title>
                <Dialog.Close className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </Dialog.Close>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                <FormField
                  icon={BookOpen}
                  label="Nome"
                  id="discipline-name"
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="Ex: Cálculo I"
                />
                <FormField
                  icon={Hash}
                  label="Código"
                  id="discipline-code"
                  value={formData.code}
                  onChange={(v) => setFormData({ ...formData, code: v })}
                  placeholder="Ex: MAT101"
                />
                <FormField
                  icon={User}
                  label="Professor"
                  id="discipline-professor"
                  value={formData.professor}
                  onChange={(v) => setFormData({ ...formData, professor: v })}
                  placeholder="Ex: Dr. João Silva"
                />

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                  >
                    {editingDiscipline ? "Salvar alterações" : "Adicionar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}