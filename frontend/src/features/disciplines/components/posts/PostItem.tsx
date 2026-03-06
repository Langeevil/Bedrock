// components/posts/PostItem.tsx

import { Trash2, Heart, MessageCircle } from "lucide-react";
import type { Post } from "../../types/disciplineTypes";

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