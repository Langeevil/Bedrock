import type { ChatConversation, ConversationType, PresenceStatus } from "../types/chatTypes";

export type FilterMode = "all" | ConversationType;
export type DraftMode = "group" | "channel" | null;

export function sortConversations(items: ChatConversation[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });
}

export function upsertConversation(items: ChatConversation[], next: ChatConversation) {
  const found = items.some((item) => item.id === next.id);
  const merged = found
    ? items.map((item) => (item.id === next.id ? { ...item, ...next } : item))
    : [next, ...items];
  return sortConversations(merged);
}

export function conversationName(conversation: ChatConversation | null) {
  if (!conversation) return "Selecione uma conversa";
  if (conversation.type === "direct") {
    return conversation.counterpart?.nome || conversation.counterpart?.email || "Conversa direta";
  }
  return conversation.name || "Conversa sem nome";
}

export function conversationMeta(conversation: ChatConversation | null) {
  if (!conversation) return "";
  if (conversation.type === "direct") {
    return conversation.counterpart?.email || "Conversa privada";
  }
  if (conversation.type === "group") {
    return `Grupo privado - ${conversation.member_count} membros`;
  }
  return conversation.is_private
    ? `Canal privado - ${conversation.member_count} membros`
    : "Canal publico";
}

export function shortTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function initials(value?: string | null) {
  const name = (value || "").trim();
  if (!name) return "B";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function conversationTypeLabel(type: ConversationType | "all") {
  if (type === "all") return "Todas";
  if (type === "direct") return "DMs";
  if (type === "group") return "Grupos";
  return "Canais";
}

export function presenceLabel(status?: PresenceStatus | string | null) {
  if (status === "online") return "Online";
  if (status === "away") return "Ausente";
  if (status === "busy") return "Ocupado";
  return "Offline";
}

export function presenceDotClass(status?: PresenceStatus | string | null) {
  if (status === "online") return "bg-emerald-500";
  if (status === "away") return "bg-amber-400";
  if (status === "busy") return "bg-red-500";
  return "bg-slate-300";
}

export function typePillClass(type: ConversationType) {
  if (type === "direct") return "bg-blue-50 text-blue-700";
  if (type === "group") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-900 text-white";
}
