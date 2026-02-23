import { useState, type FormEvent } from "react";
import { SidebarSimple } from "../components/sidebar-simple";

interface ChatMessage {
  id: number;
  from: "voce" | "assistente";
  text: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: "assistente", text: "Bem-vindo ao chat do Bedrock." },
  ]);
  const [text, setText] = useState("");

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const userMsg: ChatMessage = { id: Date.now(), from: "voce", text: value };
    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      from: "assistente",
      text: "Mensagem recebida. Integracao em tempo real pode ser adicionada depois.",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setText("");
  }

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Chat</h1>

        <div className="card bg-white shadow h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.from === "voce"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite sua mensagem"
              className="input input-bordered bg-white flex-1"
            />
            <button className="btn btn-primary" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

