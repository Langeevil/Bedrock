// components/files/UploadFile.tsx

import { useRef } from "react";
import { Upload } from "lucide-react";

interface Props {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export function UploadFile({ onUpload, uploading }: Readonly<Props>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await onUpload(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
    >
      <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-blue-100 transition-colors">
        {uploading ? (
          <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin block" />
        ) : (
          <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-700 transition-colors">
          {uploading ? "Enviando..." : "Clique ou arraste um arquivo"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, imagens, vídeos e mais</p>
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
    </div>
  );
}