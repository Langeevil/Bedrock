// components/files/FileList.tsx

import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import type { Material } from "../../types/disciplineTypes";
import { FileItem } from "./FileItem";

interface Props {
  files: Material[];
  loading: boolean;
  onDelete?: (id: number) => void;
}

export function FileList({ files, loading, onDelete }: Readonly<Props>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 py-12 text-center"
      >
        <div className="p-4 rounded-2xl bg-slate-100">
          <FolderOpen className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm font-medium">Nenhum material enviado ainda.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {files.map((file, i) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <FileItem file={file} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}