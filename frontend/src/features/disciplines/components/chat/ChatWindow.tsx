// components/chat/ChatWindow.tsx

import { useEffect, useRef, useState } from "react";
import type { ChatMessageType } from "../../types/disciplineTypes";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

// Mock — troque por WebSocket ou polling real conforme seu backend
function useChatMessages(disciplineId: number) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  const send = (content: string) => {
    const msg: ChatMessageType = {
      id: Date.now(),
      disciplineId,
      authorName: "Você",
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
    };
    setMessages((prev) => [...prev, msg]);
  };

  return { messages, send };
}

interface Props {
  disciplineId: number;
}

export function ChatWindow({ disciplineId }: Readonly<Props>) {
  const { messages, send } = useChatMessages(disciplineId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[400px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm">Nenhuma mensagem ainda. Diga olá! 👋</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={send} />
    </div>
  );
}