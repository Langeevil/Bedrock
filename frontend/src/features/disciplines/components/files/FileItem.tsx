// components/files/FileItem.tsx

import { FileText, Image, Film, FileArchive, Download, Trash2 } from "lucide-react";
import type { Material } from "../../types/disciplineTypes";
import { formatBytes } from "../../services/filesService";

function FileIcon({ type }: { type: Material["type"] }) {
  const cls = "w-5 h-5";
  switch (type) {
    case "pdf": return <FileText className={`${cls} text-red-500`} />;
    case "doc": return <FileText className={`${cls} text-blue-500`} />;
    case "image": return <Image className={`${cls} text-emerald-500`} />;
    case "video": return <Film className={`${cls} text-purple-500`} />;
    default: return <FileArchive className={`${cls} text-slate-400`} />;
  }
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 86400) return "hoje";
  if (diff < 86400 * 2) return "ontem";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

interface Props {
  file: Material;
  onDelete?: (id: number) => void;
}

export function FileItem({ file, onDelete }: Readonly<Props>) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
        <FileIcon type={file.type} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">
          {formatBytes(file.size)} · {file.uploadedBy} · {timeAgo(file.uploadedAt)}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
        {onDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}