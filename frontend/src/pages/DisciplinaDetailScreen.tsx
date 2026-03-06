import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarSimple } from "../components/sidebar-simple";
import {
  ChevronLeft,
  Home,
  FileText,
  MessageCircle,
  Settings,
  Bell,
  Search,
  MoreHorizontal,
  Video,
  Phone,
  Plus,
  Paperclip,
  Smile,
  Send,
  Star,
  BookOpen,
} from "lucide-react";
import type { Discipline } from "../features/disciplines/services/disciplinesService";
import { getDiscipline } from "../features/disciplines/services/disciplinesService";
import { getDisciplinePosts, createDisciplinePost } from "../services/disciplinePostsService";
import { getDisciplineFiles } from "../services/disciplineFilesService";
import { motion, AnimatePresence } from "framer-motion";

const TEAMS = {
  purple: "#51abff",
  purpleHover: "#7375B5",
  purpleLight: "#E8E8F4",
  bg: "#F5F5F5",
  sidebar: "#201F1F",
  sidebarItem: "#EDEBE9",
  white: "#FFFFFF",
  border: "#E1DFDD",
  textPrimary: "#252423",
  textSecondary: "#605E5C",
  textMuted: "#A19F9D",
  accent: "#6264A7",
  online: "#92C353",
  tabActive: "#6264A7",
};

/**
 * Lê o nome salvo no login:
 *   localStorage.setItem("user_nome", data.usuario.nome)
 */
function getLoggedUserName(): string {
  return localStorage.getItem("user_nome") ?? "";
}

function Avatar({ name, size = 36 }: { readonly name: string; readonly size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colors = ["#6264A7", "#0078D4", "#038387", "#C239B3", "#CA5010", "#8764B8"];
  const color = colors[name.codePointAt(0) ?? 0 % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function OverviewTab({ discipline }: { readonly discipline: Discipline }) {
  const [recentActivities, setRecentActivities] = useState<
    Array<{
      id: string;
      user: string;
      action: string;
      time: string;
      type: "file" | "post" | "user";
      timestamp: Date;
    }>
  >([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [fileCount, setFileCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadRecentActivities() {
      try {
        setLoadingActivities(true);
        const [filesResponse, postsResponse] = await Promise.all([
          getDisciplineFiles(discipline.id, { page: 1, limit: 10 }),
          getDisciplinePosts(discipline.id, 1, 10),
        ]);

        setFileCount(filesResponse.pagination?.totalItems ?? filesResponse.data.length);

        const activities: Array<{
          id: string;
          user: string;
          action: string;
          time: string;
          type: "file" | "post" | "user";
          timestamp: Date;
        }> = [];

        filesResponse.data.forEach((file) => {
          activities.push({
            id: `file-${file.id}`,
            user: file.uploaded_by_name || "Usuário",
            action: "adicionou um novo arquivo",
            time: formatTimeAgo(new Date(file.created_at)),
            type: "file",
            timestamp: new Date(file.created_at),
          });
        });

        postsResponse.data.forEach((post) => {
          activities.push({
            id: `post-${post.id}`,
            user: post.author?.nome || "Usuário",
            action: "publicou uma mensagem",
            time: formatTimeAgo(new Date(post.created_at)),
            type: "post",
            timestamp: new Date(post.created_at),
          });
        });

        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 5));
      } catch (err) {
        console.error("Erro ao carregar atividades recentes:", err);
        setRecentActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    }

    if (discipline.id) {
      loadRecentActivities();
    }
  }, [discipline.id]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "há poucos minutos";
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #6264A7 0%, #8764B8 100%)",
          borderRadius: 8,
          padding: "24px 28px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>Bem-vindo à</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{discipline.name}</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>{discipline.professor} · {discipline.code}</div>
      </div>

      {/* Stats — só renderiza quando o backend retornar dados reais */}
      {fileCount !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div
            style={{
              background: TEAMS.white,
              border: `1px solid ${TEAMS.border}`,
              borderRadius: 8,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ color: TEAMS.purple, background: TEAMS.purpleLight, borderRadius: 8, padding: 8, display: "flex" }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1 }}>{fileCount}</div>
              <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>Arquivos</div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Descrição
        </div>
        <p style={{ fontSize: 14, color: TEAMS.textSecondary, lineHeight: 1.6, margin: 0 }}>
          Esta é a página inicial da disciplina. Adicione descrições, avisos ou links úteis relacionados ao curso aqui. Os alunos podem usar as abas acima para acessar materiais, discutir no chat e verificar as configurações.
        </p>
      </div>

      {/* Recent activity — só renderiza quando houver atividades reais */}
      {!loadingActivities && recentActivities.length > 0 && (
        <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Atividade Recente
          </div>
          {recentActivities.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: idx < recentActivities.length - 1 ? `1px solid ${TEAMS.border}` : "none",
              }}
            >
              <Avatar name={item.user} size={30} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary }}>{item.user}</span>{" "}
                <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{item.action}</span>
              </div>
              <span style={{ fontSize: 12, color: TEAMS.textMuted }}>{item.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialsTab({
  disciplineId,
  navigate: _navigate,
}: {
  readonly disciplineId: number;
  readonly navigate: (path: string) => void;
}) {
  const [files, setFiles] = useState<
    Array<{ id: number; original_name: string; mime_type: string; size_bytes: number; created_at: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        const response = await getDisciplineFiles(disciplineId, { page: 1, limit: 50 });
        setFiles(response.data);
      } catch (err) {
        console.error("Erro ao carregar arquivos:", err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }
    if (disciplineId) loadFiles();
  }, [disciplineId]);

  const getFileType = (mimeType: string): string => {
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "pptx";
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document")) return "docx";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "xlsx";
    return "file";
  };

  const typeColors: Record<string, string> = {
    pptx: "#D83B01", pdf: "#D13438", docx: "#0078D4", xlsx: "#217346", file: "#605E5C",
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: TEAMS.textPrimary }}>{files.length} arquivos</span>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6, background: TEAMS.purple,
            color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          <Plus size={14} /> Adicionar arquivo
        </button>
      </div>
      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, overflow: "hidden" }}>
        {loading && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: TEAMS.textSecondary, fontSize: 14 }}>
            Carregando arquivos...
          </div>
        )}
        {!loading && files.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: TEAMS.textMuted, fontSize: 14 }}>
            Nenhum arquivo adicionado ainda.
          </div>
        )}
        {!loading && files.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", padding: "10px 16px", background: "#FAF9F8", borderBottom: `1px solid ${TEAMS.border}`, fontSize: 12, fontWeight: 600, color: TEAMS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <span>Nome</span><span>Tamanho</span><span>Modificado</span><span></span>
            </div>
            {files.map((file, index) => {
              const fileType = getFileType(file.mime_type);
              return (
                <button
                  key={file.id}
                  onClick={() => console.log("Arquivo clicado:", file.original_name)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", padding: "12px 16px", borderBottom: index < files.length - 1 ? `1px solid ${TEAMS.border}` : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s", background: "transparent", border: "none", fontFamily: "inherit", textAlign: "left", width: "100%" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAF9F8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: typeColors[fileType] + "18", color: typeColors[fileType], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      {fileType}
                    </div>
                    <span style={{ fontSize: 14, color: TEAMS.textPrimary, fontWeight: 500 }}>{file.original_name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{formatFileSize(file.size_bytes)}</span>
                  <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{new Date(file.created_at).toLocaleDateString("pt-BR")}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textMuted, padding: 4, borderRadius: 4 }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function ChatTab({
  disciplineId,
  currentUserName,
  navigate: _navigate,
}: {
  readonly disciplineId: number;
  readonly currentUserName: string;
  readonly navigate: (path: string) => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: number; author: { nome: string }; content: string; created_at: string; pinned: boolean }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        const response = await getDisciplinePosts(disciplineId, 1, 20);
        setMessages(response.data);
      } catch (err) {
        console.error("Erro ao carregar publicações:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    if (disciplineId) loadMessages();
  }, [disciplineId]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const messageText = input.trim();
    setSending(true);
    try {
      const newPost = await createDisciplinePost(disciplineId, {
        content: messageText,
        pinned: false,
      });
      setMessages((prev) => [newPost, ...prev]);
      setInput("");
    } catch (err) {
      console.error("Erro ao enviar publicação:", err);
      alert("Erro ao enviar publicação. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    console.log("Arquivo selecionado:", file.name, "para disciplina:", disciplineId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
      {renderChatContent(loading, messages, currentUserName)}

      {/* Composer */}
      <div style={{ border: `1px solid ${TEAMS.border}`, borderRadius: 8, background: TEAMS.white, overflow: "hidden", marginTop: 12 }}>
        <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderBottom: `1px solid ${TEAMS.border}` }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textSecondary, padding: "4px", borderRadius: 4 }}
            title="Anexar arquivo"
          >
            <Paperclip size={16} />
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          <button
            style={{ border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textSecondary, padding: 4, borderRadius: 4, display: "flex" }}
            title="Adicionar emoji"
          >
            <Smile size={16} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && send()}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: TEAMS.textPrimary, background: "transparent", fontFamily: "'Segoe UI', sans-serif", opacity: sending ? 0.6 : 1 }}
          />
          <button
            onClick={send}
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

function renderChatContent(
  loading: boolean,
  messages: Array<{ id: number; author: { nome: string }; content: string; created_at: string; pinned: boolean }>,
  currentUserName: string
) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textSecondary }}>
        Carregando publicações...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textMuted, fontSize: 14 }}>
        Nenhuma publicação ainda.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", display: "flex", flexDirection: "column", gap: 2 }}>
      {messages.map((msg) => {
        const authorName = msg.author?.nome || "Usuário";
        // Compara o nome do autor com o nome salvo no login (user_nome)
        const isMe = currentUserName !== "" && authorName === currentUserName;
        return (
          <div key={msg.id} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 10, padding: "6px 4px" }}>
            <Avatar name={authorName} size={32} />
            <div style={{ maxWidth: "70%" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEAMS.purple, marginBottom: 3 }}>
                {isMe ? "Você" : authorName}
                {msg.pinned && (
                  <span style={{ marginLeft: 8, fontSize: 11, background: "#FFF4CE", color: "#AD6B00", padding: "2px 6px", borderRadius: 3 }}>
                    📌 Fixado
                  </span>
                )}
              </div>
              <div style={{ background: TEAMS.white, color: TEAMS.textPrimary, border: `1px solid ${TEAMS.border}`, borderRadius: "12px 12px 12px 4px", padding: "8px 12px", fontSize: 14, lineHeight: 1.5 }}>
                {msg.content}
              </div>
              <div style={{ fontSize: 11, color: TEAMS.textMuted, marginTop: 3, textAlign: "left" }}>
                {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab({ discipline }: { readonly discipline: Discipline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${TEAMS.border}`, fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, background: "#FAF9F8" }}>
          Informações da Disciplina
        </div>
        {[
          { id: "name", label: "Nome", value: discipline.name },
          { id: "code", label: "Código", value: discipline.code },
          { id: "professor", label: "Professor", value: discipline.professor },
          { id: "created_at", label: "Criado em", value: discipline.created_at ? new Date(discipline.created_at).toLocaleDateString("pt-BR") : "—" },
        ].map((item, i, arr) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 100px", alignItems: "center", padding: "14px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${TEAMS.border}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textSecondary }}>{item.label}</span>
            <span style={{ fontSize: 14, color: TEAMS.textPrimary }}>{item.value}</span>
            <button style={{ border: `1px solid ${TEAMS.border}`, background: "transparent", borderRadius: 4, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: TEAMS.textSecondary, fontFamily: "'Segoe UI', sans-serif" }}>
              Editar
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: "#FEF0F1", border: "1px solid #F3D1D3", borderRadius: 8, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#A4262C", marginBottom: 6 }}>Zona de Perigo</div>
        <p style={{ fontSize: 13, color: "#605E5C", margin: "0 0 12px" }}>A exclusão da disciplina é permanente e não pode ser desfeita.</p>
        <button style={{ background: "#A4262C", color: "#fff", border: "none", borderRadius: 4, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
          Excluir Disciplina
        </button>
      </div>
    </div>
  );
}

export default function DisciplinaDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("overview");

  // Lê direto do localStorage — salvo pelo Login.tsx como "user_nome"
  const currentUserName = getLoggedUserName();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const d = await getDiscipline(Number(id));
        setDiscipline(d);
        setError(null);
        document.title = d.name + " - Disciplina";
      } catch (err: any) {
        setError(err.message || "Erro ao carregar disciplina.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: <Home size={15} /> },
    { id: "materials", label: "Arquivos", icon: <FileText size={15} /> },
    { id: "chat", label: "Publicações", icon: <MessageCircle size={15} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={15} /> },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <SidebarSimple />

      <div style={{ flex: 1, background: TEAMS.bg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEAMS.textSecondary, fontSize: 14 }}>
            Carregando...
          </div>
        )}
        {error && (
          <div style={{ margin: 24, padding: "12px 16px", background: "#FEF0F1", border: "1px solid #F3D1D3", borderRadius: 8, color: "#A4262C", fontSize: 14 }}>
            {error}
          </div>
        )}

        {discipline && (
          <>
            {/* Top bar */}
            <div style={{ background: TEAMS.white, borderBottom: `1px solid ${TEAMS.border}`, padding: "0 24px", display: "flex", flexDirection: "column" }}>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0 0", color: TEAMS.textMuted, fontSize: 12 }}>
                <button
                  onClick={() => navigate("/disciplinas")}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: TEAMS.purple, fontSize: 12, fontFamily: "'Segoe UI', sans-serif", padding: 0 }}
                >
                  <ChevronLeft size={14} /> Disciplinas
                </button>
                <span style={{ color: TEAMS.border }}>/</span>
                <span style={{ color: TEAMS.textSecondary }}>{discipline.name}</span>
              </div>

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #6264A7, #8764B8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1.2 }}>{discipline.name}</div>
                    <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>{discipline.code} · {discipline.professor}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[
                    { id: "meeting", icon: <Video size={16} />, label: "Reunião" },
                    { id: "call", icon: <Phone size={16} />, label: "Ligar" },
                    { id: "search", icon: <Search size={16} />, label: "Buscar" },
                    { id: "notifications", icon: <Bell size={16} />, label: "Notificações" },
                    { id: "favorite", icon: <Star size={16} />, label: "Favoritar" },
                    { id: "more", icon: <MoreHorizontal size={16} />, label: "Mais" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      title={btn.label}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: TEAMS.textSecondary, padding: "6px 10px", borderRadius: 4, fontSize: 12, fontFamily: "'Segoe UI', sans-serif", transition: "background 0.15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F3F2F1")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, marginTop: 8 }}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${TEAMS.purple}` : "2px solid transparent", color: tab === t.id ? TEAMS.purple : TEAMS.textSecondary, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", transition: "all 0.15s", marginBottom: -1 }}
                    onMouseEnter={(e) => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textPrimary; }}
                    onMouseLeave={(e) => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = TEAMS.textSecondary; }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, padding: 24 }}>
              <AnimatePresence mode="wait">
                {tab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <OverviewTab discipline={discipline} />
                  </motion.div>
                )}
                {tab === "materials" && (
                  <motion.div key="materials" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <MaterialsTab disciplineId={discipline.id} navigate={navigate} />
                  </motion.div>
                )}
                {tab === "chat" && (
                  <motion.div key="chat" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <ChatTab disciplineId={discipline.id} currentUserName={currentUserName} navigate={navigate} />
                  </motion.div>
                )}
                {tab === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                    <SettingsTab discipline={discipline} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}