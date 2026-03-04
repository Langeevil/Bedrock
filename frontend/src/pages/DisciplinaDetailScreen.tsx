import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarSimple } from "../components/sidebar-simple";
import {
  ChevronLeft,
  Home,
  FileText,
  MessageCircle,
  Settings,
  Users,
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
  Calendar,
} from "lucide-react";
import type { Discipline } from "../services/disciplinesService";
import { getDiscipline } from "../services/disciplinesService";
import { motion, AnimatePresence } from "framer-motion";

// Teams color palette
const TEAMS = {
  purple: "#6264A7",
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

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colors = ["#6264A7", "#0078D4", "#038387", "#C239B3", "#CA5010", "#8764B8"];
  const color = colors[name.charCodeAt(0) % colors.length];
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

function OverviewTab({ discipline }: { discipline: Discipline }) {
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
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -30,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>
          Bem-vindo à
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{discipline.name}</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          {discipline.professor} · {discipline.code}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { icon: <Users size={18} />, label: "Membros", value: "34" },
          { icon: <FileText size={18} />, label: "Arquivos", value: "12" },
          { icon: <Calendar size={18} />, label: "Reuniões", value: "3" },
        ].map((stat) => (
          <div
            key={stat.label}
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
            <div
              style={{
                color: TEAMS.purple,
                background: TEAMS.purpleLight,
                borderRadius: 8,
                padding: 8,
                display: "flex",
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div
                style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div
        style={{
          background: TEAMS.white,
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TEAMS.textPrimary,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Descrição
        </div>
        <p style={{ fontSize: 14, color: TEAMS.textSecondary, lineHeight: 1.6, margin: 0 }}>
          Esta é a página inicial da disciplina. Adicione descrições, avisos ou links úteis
          relacionados ao curso aqui. Os alunos podem usar as abas acima para acessar materiais,
          discutir no chat e verificar as configurações.
        </p>
      </div>

      {/* Recent activity */}
      <div
        style={{
          background: TEAMS.white,
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TEAMS.textPrimary,
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Atividade Recente
        </div>
        {[
          {
            user: "Prof. Santos",
            action: "adicionou um novo arquivo",
            time: "há 2h",
            type: "file",
          },
          {
            user: "Maria Oliveira",
            action: "enviou uma mensagem no chat",
            time: "há 3h",
            type: "chat",
          },
          { user: "João Silva", action: "entrou na disciplina", time: "há 1d", type: "user" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < 2 ? `1px solid ${TEAMS.border}` : "none",
            }}
          >
            <Avatar name={item.user} size={30} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary }}>
                {item.user}
              </span>{" "}
              <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{item.action}</span>
            </div>
            <span style={{ fontSize: 12, color: TEAMS.textMuted }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsTab() {
  const files = [
    { name: "Slides Aula 01.pptx", size: "2.4 MB", date: "01/03/2026", type: "pptx" },
    { name: "Lista de Exercícios.pdf", size: "340 KB", date: "15/02/2026", type: "pdf" },
    { name: "Ementa do Curso.docx", size: "128 KB", date: "10/02/2026", type: "docx" },
    { name: "Dados Experimento.xlsx", size: "1.1 MB", date: "28/02/2026", type: "xlsx" },
  ];

  const typeColors: Record<string, string> = {
    pptx: "#D83B01",
    pdf: "#D13438",
    docx: "#0078D4",
    xlsx: "#217346",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: TEAMS.textPrimary }}>
          {files.length} arquivos
        </span>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: TEAMS.purple,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          <Plus size={14} /> Adicionar arquivo
        </button>
      </div>
      <div
        style={{
          background: TEAMS.white,
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 80px",
            padding: "10px 16px",
            background: "#FAF9F8",
            borderBottom: `1px solid ${TEAMS.border}`,
            fontSize: 12,
            fontWeight: 600,
            color: TEAMS.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Nome</span>
          <span>Tamanho</span>
          <span>Modificado</span>
          <span></span>
        </div>
        {files.map((file, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 80px",
              padding: "12px 16px",
              borderBottom: i < files.length - 1 ? `1px solid ${TEAMS.border}` : "none",
              alignItems: "center",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAF9F8")}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  background: typeColors[file.type] + "18",
                  color: typeColors[file.type],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {file.type}
              </div>
              <span style={{ fontSize: 14, color: TEAMS.textPrimary, fontWeight: 500 }}>
                {file.name}
              </span>
            </div>
            <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{file.size}</span>
            <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{file.date}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: TEAMS.textMuted,
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockMessages = [
  {
    id: 1,
    user: "Prof. Santos",
    text: "Olá a todos! Bem-vindos à disciplina. Aproveitem os materiais disponíveis.",
    time: "09:12",
    self: false,
  },
  {
    id: 2,
    user: "Maria Oliveira",
    text: "Obrigada professor! Já vi os slides da primeira aula.",
    time: "09:45",
    self: false,
  },
  {
    id: 3,
    user: "Você",
    text: "Quando teremos a primeira lista de exercícios?",
    time: "10:02",
    self: true,
  },
  {
    id: 4,
    user: "Prof. Santos",
    text: "A lista será disponibilizada na próxima semana. Fiquem atentos às notificações.",
    time: "10:15",
    self: false,
  },
];

function ChatTab(_: { navigate: (path: string) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "Você",
        text: input.trim(),
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        self: true,
      },
    ]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.self ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: 10,
              padding: "6px 4px",
            }}
          >
            {!msg.self && <Avatar name={msg.user} size={32} />}
            <div style={{ maxWidth: "70%" }}>
              {!msg.self && (
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: TEAMS.purple, marginBottom: 3 }}
                >
                  {msg.user}
                </div>
              )}
              <div
                style={{
                  background: msg.self ? TEAMS.purple : TEAMS.white,
                  color: msg.self ? "#fff" : TEAMS.textPrimary,
                  border: msg.self ? "none" : `1px solid ${TEAMS.border}`,
                  borderRadius: msg.self ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  padding: "8px 12px",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: TEAMS.textMuted,
                  marginTop: 3,
                  textAlign: msg.self ? "right" : "left",
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div
        style={{
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          background: TEAMS.white,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            display: "flex",
            gap: 8,
            borderBottom: `1px solid ${TEAMS.border}`,
          }}
        >
          {[<Paperclip size={16} />, <Smile size={16} />].map((icon, i) => (
            <button
              key={i}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: TEAMS.textSecondary,
                padding: 4,
                borderRadius: 4,
                display: "flex",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digite uma mensagem..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: TEAMS.textPrimary,
              background: "transparent",
              fontFamily: "'Segoe UI', sans-serif",
            }}
          />
          <button
            onClick={send}
            style={{
              background: input.trim() ? TEAMS.purple : TEAMS.border,
              color: input.trim() ? "#fff" : TEAMS.textMuted,
              border: "none",
              borderRadius: 4,
              padding: "6px 10px",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s",
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ discipline }: { discipline: Discipline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: TEAMS.white,
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${TEAMS.border}`,
            fontSize: 13,
            fontWeight: 600,
            color: TEAMS.textPrimary,
            background: "#FAF9F8",
          }}
        >
          Informações da Disciplina
        </div>
        {[
          { label: "Nome", value: discipline.name },
          { label: "Código", value: discipline.code },
          { label: "Professor", value: discipline.professor },
          {
            label: "Criado em",
            value: discipline.created_at
              ? new Date(discipline.created_at).toLocaleDateString("pt-BR")
              : "—",
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 100px",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: i < arr.length - 1 ? `1px solid ${TEAMS.border}` : "none",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textSecondary }}>
              {item.label}
            </span>
            <span style={{ fontSize: 14, color: TEAMS.textPrimary }}>{item.value}</span>
            <button
              style={{
                border: `1px solid ${TEAMS.border}`,
                background: "transparent",
                borderRadius: 4,
                padding: "5px 12px",
                fontSize: 12,
                cursor: "pointer",
                color: TEAMS.textSecondary,
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#FEF0F1",
          border: "1px solid #F3D1D3",
          borderRadius: 8,
          padding: "16px 20px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#A4262C", marginBottom: 6 }}>
          Zona de Perigo
        </div>
        <p style={{ fontSize: 13, color: "#605E5C", margin: "0 0 12px" }}>
          A exclusão da disciplina é permanente e não pode ser desfeita.
        </p>
        <button
          style={{
            background: "#A4262C",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
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
    <div
      style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <SidebarSimple />

      <div
        style={{
          flex: 1,
          background: TEAMS.bg,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: TEAMS.textSecondary,
              fontSize: 14,
            }}
          >
            Carregando...
          </div>
        )}
        {error && (
          <div
            style={{
              margin: 24,
              padding: "12px 16px",
              background: "#FEF0F1",
              border: "1px solid #F3D1D3",
              borderRadius: 8,
              color: "#A4262C",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {discipline && (
          <>
            {/* Top bar */}
            <div
              style={{
                background: TEAMS.white,
                borderBottom: `1px solid ${TEAMS.border}`,
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Breadcrumb */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 0 0",
                  color: TEAMS.textMuted,
                  fontSize: 12,
                }}
              >
                <button
                  onClick={() => navigate("/disciplinas")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: TEAMS.purple,
                    fontSize: 12,
                    fontFamily: "'Segoe UI', sans-serif",
                    padding: 0,
                  }}
                >
                  <ChevronLeft size={14} /> Disciplinas
                </button>
                <span style={{ color: TEAMS.border }}>/</span>
                <span style={{ color: TEAMS.textSecondary }}>{discipline.name}</span>
              </div>

              {/* Title row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #6264A7, #8764B8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: TEAMS.textPrimary,
                        lineHeight: 1.2,
                      }}
                    >
                      {discipline.name}
                    </div>
                    <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>
                      {discipline.code} · {discipline.professor}
                    </div>
                  </div>
                </div>

                {/* Action buttons — Teams-style */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[
                    { icon: <Video size={16} />, label: "Reunião" },
                    { icon: <Phone size={16} />, label: "Ligar" },
                    { icon: <Search size={16} />, label: "Buscar" },
                    { icon: <Bell size={16} />, label: "Notificações" },
                    { icon: <Star size={16} />, label: "Favoritar" },
                    { icon: <MoreHorizontal size={16} />, label: "Mais" },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      title={btn.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: TEAMS.textSecondary,
                        padding: "6px 10px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "'Segoe UI', sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#F3F2F1")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      borderBottom:
                        tab === t.id ? `2px solid ${TEAMS.purple}` : "2px solid transparent",
                      color: tab === t.id ? TEAMS.purple : TEAMS.textSecondary,
                      fontSize: 13,
                      fontWeight: tab === t.id ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "'Segoe UI', sans-serif",
                      transition: "all 0.15s",
                      marginBottom: -1,
                    }}
                    onMouseEnter={(e) => {
                      if (tab !== t.id)
                        (e.currentTarget as HTMLElement).style.color = TEAMS.textPrimary;
                    }}
                    onMouseLeave={(e) => {
                      if (tab !== t.id)
                        (e.currentTarget as HTMLElement).style.color = TEAMS.textSecondary;
                    }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, padding: 24, maxWidth: 900 }}>
              <AnimatePresence mode="wait">
                {tab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <OverviewTab discipline={discipline} />
                  </motion.div>
                )}
                {tab === "materials" && (
                  <motion.div
                    key="materials"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <MaterialsTab />
                  </motion.div>
                )}
                {tab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChatTab navigate={navigate} />
                  </motion.div>
                )}
                {tab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
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
