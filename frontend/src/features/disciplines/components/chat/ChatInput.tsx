// components/chat/ChatInput.tsx

import { useState } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Readonly<Props>) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-t border-slate-100">
      <input
        type="text"
        placeholder="Digite uma mensagem..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
        disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}