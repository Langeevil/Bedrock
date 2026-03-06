// components/posts/CreatePost.tsx

import { useState } from "react";
import { Send } from "lucide-react";

interface Props {
  onSubmit: (content: string) => Promise<void>;
}

export function CreatePost({ onSubmit }: Readonly<Props>) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <textarea
        rows={3}
        placeholder="Compartilhe algo com a turma..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full resize-none text-sm text-slate-700 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Publicar
        </button>
      </div>
    </div>
  );
}