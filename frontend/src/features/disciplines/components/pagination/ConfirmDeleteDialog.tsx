import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion } from "framer-motion";

export function ConfirmDeleteDialog({ open, onConfirm, onCancel, disciplineName }: Readonly<{ open: boolean; onConfirm: () => void; onCancel: () => void; disciplineName: string }>) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <AlertDialog.Content asChild>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
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