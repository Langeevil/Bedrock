// src/features/chat/services/chatService.ts

import { io, type Socket } from "socket.io-client";
import { apiUrl, SOCKET_BASE_URL } from "../../../shared/services/config";
import { getAuthHeaders, getAuthToken, parseJsonOrThrow } from "../../../shared/services/http";
import type { 
  ChatConversation, 
  ChatConversationDetails, 
  ChatMessage, 
  ChatMessagePage, 
  ChatUserSearchResult, 
  ConversationType, 
  PresenceEntry 
} from "../types/chatTypes";

const API_URL = apiUrl("/chat");
const SOCKET_URL = SOCKET_BASE_URL;

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
  if (!res.ok) throw new Error(data.error || "Erro ao buscar usuários");
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
  if (!res.ok) throw new Error(data.error || "Erro ao listar presença");
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
