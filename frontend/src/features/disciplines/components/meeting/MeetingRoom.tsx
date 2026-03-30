import { useEffect, useState, useRef } from "react";
import { VideoGrid, type VideoStream } from "./VideoGrid";
import { MeetingControls } from "./MeetingControls";
import { MeetingSidebar } from "./MeetingSidebar";
import {
  getChatSocket,
  createConversation,
  listConversationMessages,
  listConversations,
} from "../../../chat/services/chatService";
import type { ChatMessage } from "../../../chat/types/chatTypes";
import type { Discipline } from "../../services/disciplinesService";
import { getMembersOfDiscipline } from "../../services/disciplinesService";
import type { DisciplineMember } from "../../types/disciplineTypes";

interface MeetingRoomProps {
  discipline: Discipline;
  currentUserEmail: string;
  currentUserName: string;
  onLeave: () => void;
}

export function MeetingRoom({
  discipline,
  currentUserEmail,
  currentUserName,
  onLeave,
}: Readonly<MeetingRoomProps>) {
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoStreams, setVideoStreams] = useState<VideoStream[]>([]);
  const [members, setMembers] = useState<DisciplineMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const socket = getChatSocket();

  // Carregar membros da disciplina
  useEffect(() => {
    async function loadData() {
      try {
        const membersList = await getMembersOfDiscipline(discipline.id);
        setMembers(membersList);

        // Criar ou obter conversa
        const conversations = await listConversations("all");
        let meetingConversation = conversations.find(
          (conv) =>
            conv.type === "group" &&
            conv.name?.includes(`Reunião - ${discipline.name}`)
        );

        if (!meetingConversation) {
          meetingConversation = await createConversation({
            type: "group",
            name: `Reunião - ${discipline.name}`,
            description: `Reunião da disciplina ${discipline.name}`,
            is_private: true,
            memberIds: membersList.map((m: DisciplineMember) => m.id),
          });
        }

        if (meetingConversation) {
          setConversationId(meetingConversation.id);
          const page = await listConversationMessages(meetingConversation.id);
          setMessages(page.items || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [discipline.id, discipline.name]);

  // Iniciar stream local quando reunião ativa
  useEffect(() => {
    if (!isMeetingActive) return;

    let cancelled = false;

    async function startLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: !isMuted,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        // Adicionar stream local à grade
        setVideoStreams((prev) => {
          const filtered = prev.filter((s) => !s.isLocalStream);
          return [
            {
              userId: 0,
              userName: `${currentUserName} (Você)`,
              stream,
              isLocalStream: true,
              isMuted,
            },
            ...filtered,
          ];
        });

        // Notificar que estou na reunião
        socket.emit("meeting:joined", {
          disciplineId: discipline.id,
          userName: currentUserName,
          email: currentUserEmail,
        });
      } catch (err) {
        console.error("Erro ao acessar câmera/microfone:", err);
        alert("Teste de acesso a mídia foi recusado ou indisponível");
      }
    }

    startLocalStream();

    return () => {
      cancelled = true;
    };
  }, [isMeetingActive, isVideoOn, isMuted, currentUserName, currentUserEmail, discipline.id, socket]);

  // Controlar áudio/vídeo
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOn;
      });
    }
  }, [isVideoOn]);

  // Escutar mensagens de chat
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("chat:subscribe", { conversationId });

    const handleMessage = (message: ChatMessage) => {
      if (message.conversation_id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("chat:messageCreated", handleMessage);

    return () => {
      socket.off("chat:messageCreated", handleMessage);
      socket.emit("chat:unsubscribe", { conversationId });
    };
  }, [conversationId, socket]);

  const handleSendMessage = (content: string) => {
    if (conversationId) {
      socket.emit("chat:sendMessage", {
        conversationId,
        content,
      });
    }
  };

  const handleLeave = () => {
    // Parar streams locais
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Notificar que saí
    socket.emit("meeting:left", {
      disciplineId: discipline.id,
      email: currentUserEmail,
    });

    setIsMeetingActive(false);
    onLeave();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#1a1a1a",
          color: "#aaa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #444",
              borderTop: "3px solid #2196f3",
              borderRadius: 0,
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Preparando reunião...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0a0a0a",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "#1a1a1a",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#ddd" }}>
          Reunião: {discipline.name}
        </h2>
        <div style={{ fontSize: 12, color: "#999" }}>
          {isMeetingActive ? (
            <span style={{ color: "#27ae60" }}>● Reunião ativa</span>
          ) : (
            <span style={{ color: "#95a5a6" }}>○ Reunião não iniciada</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          gap: 0,
        }}
      >
        {/* Video Grid */}
        <VideoGrid videoStreams={videoStreams} />

        {/* Sidebar */}
        <MeetingSidebar
          messages={messages}
          members={members}
          onSendMessage={handleSendMessage}
          currentUserEmail={currentUserEmail}
          isMeetingActive={isMeetingActive}
        />
      </div>

      {/* Controls Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setIsMeetingActive(!isMeetingActive)}
          style={{
            padding: "8px 20px",
            background: isMeetingActive ? "transparent" : "#27ae60",
            color: isMeetingActive ? "#27ae60" : "white",
            border: isMeetingActive ? "2px solid #27ae60" : "none",
            borderRadius: 0,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            marginRight: "auto",
            margin: 12,
          }}
        >
          {isMeetingActive ? "Pausar" : "Iniciar Reunião"}
        </button>
        <MeetingControls
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          onToggleMic={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setIsVideoOn(!isVideoOn)}
          onLeave={handleLeave}
          onShare={() => alert("Compartilhamento de tela em desenvolvimento")}
          onSettings={() => alert("Configurações em desenvolvimento")}
        />
      </div>
    </div>
  );
}
