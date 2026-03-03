import { io, type Socket } from "socket.io-client";
import { getAuthHeaders, getAuthToken, parseJsonOrThrow } from "./http";

export type ConversationType = "direct" | "group" | "channel";
export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface ChatAttachment {
  id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface ChatCounterpart {
  id: number;
  nome: string;
  email: string;
  presence_status?: PresenceStatus;
}

export interface ChatMember {
  id: number;
  nome: string;
  email: string;
  role?: string;
  member_role: "owner" | "admin" | "member";
  joined_at: string;
  presence_status?: PresenceStatus;
}

export interface ChatConversation {
  id: number;
  type: ConversationType;
  name: string | null;
  description?: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  member_count: number;
  counterpart?: ChatCounterpart | null;
}

export interface ChatConversationDetails extends ChatConversation {
  members: ChatMember[];
  permissions: {
    can_manage_members: boolean;
    can_edit: boolean;
  };
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: "text";
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  sender: {
    id: number;
    nome: string;
    email: string;
  };
  attachments: ChatAttachment[];
}

export interface ChatMessagePage {
  items: ChatMessage[];
  has_more: boolean;
  conversation?: ChatConversation | null;
}

export interface ChatUserSearchResult {
  id: number;
  nome: string;
  email: string;
  role?: string;
  presence_status?: PresenceStatus;
}

export interface PresenceEntry {
  id: number;
  nome: string;
  email: string;
  status: PresenceStatus;
  last_seen_at?: string | null;
}

const API_URL = "http://localhost:4000/api/chat";
const SOCKET_URL = "http://localhost:4000";

function conversationQuery(type?: ConversationType | "all") {
  if (!type || type === "all") {
    return "?include_public=true";
  }

  return `?include_public=true&type=${type}`;
}

export async function listConversations(
  type?: ConversationType | "all"
): Promise<ChatConversation[]> {
  const res = await fetch(`${API_URL}/conversations${conversationQuery(type)}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao listar conversas");
  return Array.isArray(data) ? (data as ChatConversation[]) : [];
}

export async function searchChatUsers(query: string): Promise<ChatUserSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const res = await fetch(
    `${API_URL}/users/search?q=${encodeURIComponent(trimmed)}`,
    {
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao buscar usuarios");
  return Array.isArray(data) ? (data as ChatUserSearchResult[]) : [];
}

export async function createDirectConversation(
  targetUserId: number
): Promise<ChatConversationDetails> {
  const res = await fetch(`${API_URL}/conversations/direct`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetUserId }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao abrir conversa");
  return data as ChatConversationDetails;
}

export async function createConversation(input: {
  type: "group" | "channel";
  name: string;
  description?: string;
  is_private?: boolean;
  memberIds?: number[];
}): Promise<ChatConversationDetails> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao criar conversa");
  return data as ChatConversationDetails;
}

export async function getConversationDetails(
  conversationId: number
): Promise<ChatConversationDetails> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar conversa");
  return data as ChatConversationDetails;
}

export async function addConversationMembers(
  conversationId: number,
  userIds: number[]
): Promise<ChatConversationDetails> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userIds }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao adicionar membros");
  return data as ChatConversationDetails;
}

export async function listConversationMessages(
  conversationId: number,
  options: { beforeMessageId?: number; limit?: number } = {}
): Promise<ChatMessagePage> {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit || 30));

  if (options.beforeMessageId) {
    params.set("beforeMessageId", String(options.beforeMessageId));
  }

  const res = await fetch(
    `${API_URL}/conversations/${conversationId}/messages?${params.toString()}`,
    {
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao carregar mensagens");

  return {
    items: Array.isArray(data.items) ? (data.items as ChatMessage[]) : [],
    has_more: Boolean(data.has_more),
    conversation: data.conversation as ChatConversation | undefined,
  };
}

export async function sendConversationMessage(
  conversationId: number,
  content: string
): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content, messageType: "text" }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao enviar mensagem");
  return data as ChatMessage;
}

export async function markConversationRead(
  conversationId: number,
  lastReadMessageId: number
): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ lastReadMessageId }),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao marcar leitura");
}

export async function listRelevantPresence(): Promise<PresenceEntry[]> {
  const res = await fetch(`${API_URL}/presence`, {
    headers: getAuthHeaders(false),
  });

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Erro ao listar presenca");
  return Array.isArray(data) ? (data as PresenceEntry[]) : [];
}

let socketInstance: Socket | null = null;

export function getChatSocket(): Socket {
  if (socketInstance) return socketInstance;

  socketInstance = io(SOCKET_URL, {
    auth: { token: getAuthToken() },
    transports: ["websocket"],
  });

  return socketInstance;
}

export function disconnectChatSocket() {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
}
