import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Users } from "lucide-react";
import { TEAMS } from "../../constants/teamsTheme";
import type { ChatMessage } from "../../../chat/types/chatTypes";
import type { DisciplineMember } from "../../types/disciplineTypes";

interface MeetingSidebarProps {
  messages: ChatMessage[];
  members: DisciplineMember[];
  onSendMessage: (content: string) => void;
  currentUserEmail: string;
  isMeetingActive: boolean;
}

export function MeetingSidebar({
  messages,
  members,
  onSendMessage,
  currentUserEmail,
  isMeetingActive,
}: Readonly<MeetingSidebarProps>) {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageText.trim() || sending || !isMeetingActive) return;

    setSending(true);
    try {
      onSendMessage(messageText.trim());
      setMessageText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 320,
        background: "#fff",
        border: `1px solid ${TEAMS.border}`,
        borderRadius: 0,
      }}
    >
      {/* Tabs Header */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${TEAMS.border}`,
          background: "#f5f5f5",
        }}
      >
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: activeTab === "chat" ? TEAMS.white : "#f5f5f5",
            border: "none",
            borderBottom: activeTab === "chat" ? `3px solid ${TEAMS.purple}` : "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: activeTab === "chat" ? TEAMS.purple : TEAMS.textSecondary,
            transition: "all 0.2s",
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("members")}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: activeTab === "members" ? TEAMS.white : "#f5f5f5",
            border: "none",
            borderBottom: activeTab === "members" ? `3px solid ${TEAMS.purple}` : "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: activeTab === "members" ? TEAMS.purple : TEAMS.textSecondary,
            transition: "all 0.2s",
          }}
        >
          <Users size={14} style={{ display: "inline-block", marginRight: 4 }} />
          {members.length}
        </button>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {activeTab === "chat" ? (
          <>
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: TEAMS.textMuted,
                    fontSize: 12,
                    textAlign: "center",
                    padding: 16,
                  }}
                >
                  Nenhuma mensagem ainda
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.email === currentUserEmail;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: isMe ? "row-reverse" : "row",
                        gap: 6,
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "85%",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: TEAMS.purple,
                            marginBottom: 2,
                            textAlign: isMe ? "right" : "left",
                          }}
                        >
                          {isMe ? "Você" : msg.sender.nome}
                        </div>
                        <div
                          style={{
                            background: isMe ? TEAMS.purple : "#f0f0f0",
                            color: isMe ? TEAMS.white : TEAMS.textPrimary,
                            border: isMe ? "none" : `1px solid ${TEAMS.border}`,
                            padding: "6px 10px",
                            fontSize: 12,
                            wordWrap: "break-word",
                            lineHeight: 1.3,
                          }}
                        >
                          {msg.content}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: TEAMS.textMuted,
                            marginTop: 2,
                            textAlign: isMe ? "right" : "left",
                          }}
                        >
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: 12,
                borderTop: `1px solid ${TEAMS.border}`,
                display: "flex",
                gap: 6,
              }}
            >
              <input
                aria-label="Mensagem da reuniao"
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escrever mensagem..."
                disabled={!isMeetingActive}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  border: `1px solid ${TEAMS.border}`,
                  borderRadius: 0,
                  fontSize: 12,
                  outline: "none",
                  cursor: isMeetingActive ? "auto" : "not-allowed",
                }}
              />
              <button
                type="submit"
                aria-label="Enviar mensagem da reuniao"
                disabled={!isMeetingActive || sending || !messageText.trim()}
                style={{
                  padding: "6px 10px",
                  background: isMeetingActive ? TEAMS.purple : "#ccc",
                  color: TEAMS.white,
                  border: "none",
                  borderRadius: 0,
                  cursor: isMeetingActive ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          /* Members List */
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: 8,
                  background: "#f5f5f5",
                  border: `1px solid ${TEAMS.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    background: TEAMS.purple,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {member.nome.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: TEAMS.textPrimary,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.nome}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: TEAMS.textMuted,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
