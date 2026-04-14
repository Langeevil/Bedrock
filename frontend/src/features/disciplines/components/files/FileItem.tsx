// components/files/FileItem.tsx

import { FileText, Image, Film, FileArchive, Download, Trash2 } from "lucide-react";
import type { Material } from "../../types/disciplineTypes";
import { formatBytes } from "../../services/filesService";

function fileCategory(file: Material) {
  if (file.mime_type.includes("pdf")) return "pdf";
  if (file.mime_type.startsWith("image/")) return "image";
  if (file.mime_type.startsWith("video/")) return "video";
  if (file.mime_type.includes("word") || file.mime_type.includes("document")) return "doc";
  return "archive";
}

function FileIcon({ type }: { type: string }) {
  const cls = "w-5 h-5";
  switch (type) {
    case "pdf":
      return <FileText className={`${cls} text-red-500`} />;
    case "doc":
      return <FileText className={`${cls} text-blue-500`} />;
    case "image":
      return <Image className={`${cls} text-emerald-500`} />;
    case "video":
      return <Film className={`${cls} text-purple-500`} />;
    default:
      return <FileArchive className={`${cls} text-slate-400`} />;
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
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
        <FileIcon type={fileCategory(file)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{file.original_name}</p>
        <p className="text-xs text-slate-400">
          {formatBytes(file.size_bytes)} - {timeAgo(file.created_at)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(file.id)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
