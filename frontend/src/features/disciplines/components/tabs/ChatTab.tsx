// src/features/disciplines/components/tabs/ChatTab.tsx

import { useEffect, useState } from "react";
import { Paperclip, Smile, Send } from "lucide-react";
import { Avatar } from "../Avatar";
import { TEAMS } from "../../constants/teamsTheme";
import type { Post } from "../../types/disciplineTypes";
import { listPosts as getDisciplinePosts, createPost as createDisciplinePost } from "../../services/postsService";
import { uploadFile, downloadFile } from "../../services/filesService";

interface Props {
  disciplineId: number;
  currentUserName: string;
}

export function ChatTab({ disciplineId, currentUserName }: Readonly<Props>) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!disciplineId) return;
    setLoading(true);
    getDisciplinePosts(disciplineId, 1, 50)
      .then((r) => setMessages(r.data))
      .catch((err) => { console.error(err); setMessages([]); })
      .finally(() => setLoading(false));
  }, [disciplineId]);

  const send = async (content: string, fileId?: number) => {
    if ((!content.trim() && !fileId) || sending) return;
    setSending(true);
    try {
      const newPost = await createDisciplinePost(disciplineId, content.trim(), fileId);
      setMessages((prev) => [newPost, ...prev]);
      setInput("");
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar publicação. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);
    try {
      // 1. Upload do arquivo
      const uploadedFile = await uploadFile(disciplineId, file);
      // 2. Criar post vinculado ao arquivo (passando o nome do arquivo no conteúdo se vazio)
      await send("", uploadedFile.id);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao enviar arquivo.");
    } finally {
      setSending(false);
      e.target.value = ""; // Limpar input
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
      {/* Messages */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textSecondary }}>Carregando publicações...</div>
      ) : messages.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textMuted, fontSize: 14 }}>Nenhuma publicação ainda.</div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.map((msg) => {
            const authorName = msg.authorName;
            const isMe = currentUserName !== "" && (authorName === currentUserName || authorName === "Você");
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 10, padding: "6px 4px" }}>
                <Avatar name={authorName} size={32} />
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEAMS.purple, marginBottom: 3 }}>
                    {isMe ? "Você" : authorName}
                    {msg.pinned && (
                      <span style={{ marginLeft: 8, fontSize: 11, background: "#FFF4CE", color: "#AD6B00", padding: "2px 6px", borderRadius: 3 }}>📌 Fixado</span>
                    )}
                  </div>
                  <div style={{ background: TEAMS.white, color: TEAMS.textPrimary, border: `1px solid ${TEAMS.border}`, borderRadius: "12px 12px 12px 4px", padding: "8px 12px", fontSize: 14, lineHeight: 1.5 }}>
                    {msg.content}
                    {msg.fileName && (
                      <div 
                        onClick={() => downloadFile(disciplineId, msg.fileId!, msg.fileName!)}
                        style={{ marginTop: msg.content ? 8 : 0, padding: 8, background: "#f3f2f1", borderRadius: 4, display: "flex", alignItems: "center", gap: 8, border: "1px solid #e1dfdd", cursor: "pointer" }}
                      >
                        <Paperclip size={14} />
                        <span style={{ fontSize: 13, color: TEAMS.purple, fontWeight: 500 }}>{msg.fileName}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: TEAMS.textMuted, marginTop: 3, textAlign: "left" }}>
                    {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Composer */}
      <div style={{ border: `1px solid ${TEAMS.border}`, borderRadius: 8, background: TEAMS.white, overflow: "hidden", marginTop: 12 }}>
        <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderBottom: `1px solid ${TEAMS.border}` }}>
          <label style={{ display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textSecondary, padding: 4, borderRadius: 4 }} title="Anexar arquivo">
            <Paperclip size={16} />
            <input aria-label="Anexar arquivo ao chat" type="file" onChange={handleFileUpload} disabled={sending} style={{ display: "none" }} />
          </label>
          <button style={{ border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textSecondary, padding: 4, borderRadius: 4, display: "flex" }} title="Emoji">
            <Smile size={16} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
          <input
            aria-label="Mensagem do chat"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && send(input)}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: TEAMS.textPrimary, background: "transparent", fontFamily: "'Segoe UI', sans-serif", opacity: sending ? 0.6 : 1 }}
          />
          <button
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            style={{ background: input.trim() && !sending ? TEAMS.purple : TEAMS.border, color: input.trim() && !sending ? "#fff" : TEAMS.textMuted, border: "none", borderRadius: 4, padding: "6px 10px", cursor: input.trim() && !sending ? "pointer" : "default", display: "flex", alignItems: "center", transition: "all 0.15s", opacity: sending ? 0.6 : 1 }}
          >
            {sending ? "..." : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
