// components/chat/ChatMessage.tsx

import type { ChatMessageType } from "../../types/disciplineTypes";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function timeStr(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Readonly<Props>) {
  const isMine = message.isMine;

  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white text-xs font-bold shrink-0 mb-0.5">
          {initials(message.authorName)}
        </span>
      )}
      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-xs font-semibold text-slate-500 px-1">{message.authorName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-br-md"
              : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{timeStr(message.createdAt)}</span>
      </div>
    </div>
  );
}