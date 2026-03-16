// src/features/chat/types/chatTypes.ts

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
