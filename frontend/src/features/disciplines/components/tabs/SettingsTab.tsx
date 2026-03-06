// components/tabs/SettingsTab.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, Hash, Trash2, User } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Discipline } from "../../services/disciplinesService";
import { removeDiscipline, updateDiscipline } from "../../services/disciplinesService";

const schema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres.").max(100).trim(),
  code: z.string().min(2, "Mínimo 2 caracteres.").max(20).regex(/^[A-Za-z0-9]+$/, "Apenas letras e números.").trim(),
  professor: z.string().min(3, "Mínimo 3 caracteres.").max(100).trim(),
});
type FormData = z.infer<typeof schema>;

interface FieldProps {
  icon: React.ElementType;
  label: string;
  id: string;
  placeholder: string;
  error?: string;
  registration: object;
}

function Field({ icon: Icon, label, id, placeholder, error, registration }: Readonly<FieldProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        {...registration}
        className={`w-full px-3 py-2.5 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition ${
          error ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-slate-200 focus:ring-blue-400"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  discipline: Discipline;
  onUpdated: (d: Discipline) => void;
}

export function SettingsTab({ discipline, onUpdated }: Readonly<Props>) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: discipline.name, code: discipline.code, professor: discipline.professor },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateDiscipline(discipline.id, data);
      onUpdated(updated as Discipline);
      toast.success("Disciplina atualizada!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar.");
    }
  };

  const handleDelete = async () => {
    try {
      await removeDiscipline(discipline.id);
      toast.success("Disciplina excluída.");
      navigate("/disciplinas");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Informações da disciplina</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field icon={BookOpen} label="Nome" id="s-name" placeholder="Ex: Cálculo I" error={errors.name?.message} registration={register("name")} />
          <Field icon={Hash} label="Código" id="s-code" placeholder="Ex: MAT101" error={errors.code?.message} registration={register("code")} />
          <Field icon={User} label="Professor" id="s-professor" placeholder="Ex: Dr. João Silva" error={errors.professor?.message} registration={register("professor")} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 disabled:cursor-not-allowed self-end"
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <h3 className="font-semibold text-red-600 mb-1">Zona de perigo</h3>
        <p className="text-sm text-slate-500 mb-4">Ações irreversíveis para esta disciplina.</p>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir disciplina
        </button>
      </div>

      {/* Confirm delete */}
      <AlertDialog.Root open={confirmDelete}>
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
                Tem certeza que deseja excluir <span className="font-semibold text-slate-700">"{discipline.name}"</span>? Essa ação não pode ser desfeita.
              </AlertDialog.Description>
              <div className="flex gap-3 justify-end">
                <AlertDialog.Cancel asChild>
                  <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm">
                    Sim, excluir
                  </button>
                </AlertDialog.Action>
              </div>
            </motion.div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}