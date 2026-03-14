// components/posts/PostItem.tsx

import { Trash2, Heart, MessageCircle, Paperclip, Download } from "lucide-react";
import type { Post } from "../../types/disciplineTypes";
import { downloadFile } from "../../services/filesService";

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface Props {
  post: Post;
  onDelete?: (id: number) => void;
}

export function PostItem({ post, onDelete }: Readonly<Props>) {
  const handleDownload = () => {
    if (post.fileId && post.fileName) {
      downloadFile(post.disciplineId, post.fileId, post.fileName);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-bold shrink-0">
            {initials(post.authorName)}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{post.authorName}</p>
            <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {post.fileName && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={handleDownload}
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                {post.fileName}
              </span>
              <span className="text-[10px] text-slate-400">
                {(post.fileSize || 0) / 1024 < 1024 
                  ? `${Math.round((post.fileSize || 0) / 1024)} KB` 
                  : `${Math.round((post.fileSize || 0) / 1024 / 1024)} MB`}
              </span>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors">
          <Heart className="w-3.5 h-3.5" />
          {post.likes}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comments}
        </button>
      </div>
    </div>
  );
}
