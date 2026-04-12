import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  addConversationMembers,
  createConversation,
  createDirectConversation,
  getChatSocket,
  getConversationDetails,
  listConversations,
  listConversationMessages,
  markConversationRead,
  searchChatUsers,
} from "../services/chatService";
import type {
  ChatConversation,
  ChatConversationDetails,
  ChatMessage,
  ChatUserSearchResult,
} from "../types/chatTypes";
import {
  sortConversations,
  upsertConversation,
  type DraftMode,
  type FilterMode,
} from "../utils/chatFormatters";

interface ChatContextType {
  // State
  conversations: ChatConversation[];
  visibleConversations: ChatConversation[];
  activeId: number | null;
  activeConversation: ChatConversationDetails | null;
  messages: ChatMessage[];
  filter: FilterMode;
  loadingList: boolean;
  loadingConversation: boolean;
  loadingOlder: boolean;
  hasMore: boolean;
  error: string | null;
  currentUserEmail: string;
  currentUserName: string;

  // Search/Draft state
  userSearch: string;
  userResults: ChatUserSearchResult[];
  draftMode: DraftMode;
  draftName: string;
  draftDescription: string;
  draftIsPrivate: boolean;
  draftSearch: string;
  draftSearchResults: ChatUserSearchResult[];
  draftMembers: ChatUserSearchResult[];
  manageSearch: string;
  manageResults: ChatUserSearchResult[];
  
  // UI state
  detailsOpen: boolean;
  addMembersOpen: boolean;

  // Actions
  setActiveId: (id: number | null) => void;
  setFilter: (filter: FilterMode) => void;
  setUserSearch: (value: string) => void;
  setDetailsOpen: (open: boolean) => void;
  setAddMembersOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  
  // Draft Actions
  setDraftName: (name: string) => void;
  setDraftDescription: (desc: string) => void;
  setDraftIsPrivate: (isPrivate: boolean) => void;
  setDraftSearch: (search: string) => void;
  resetDraft: (mode: DraftMode) => void;
  addDraftMember: (user: ChatUserSearchResult) => void;
  removeDraftMember: (userId: number) => void;
  submitDraft: (event: FormEvent) => Promise<void>;

  // Chat Actions
  sendMessage: (content: string) => void;
  loadOlderMessages: () => Promise<void>;
  openDirectConversation: (user: ChatUserSearchResult) => Promise<void>;
  addMember: (user: ChatUserSearchResult) => Promise<void>;
  setManageSearch: (search: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const currentUserEmail = localStorage.getItem("user_email") || "";
  const currentUserName = localStorage.getItem("user_nome") || "Usuario";

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeConversation, setActiveConversation] = useState<ChatConversationDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search/Draft state
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ChatUserSearchResult[]>([]);
  const [draftMode, setDraftMode] = useState<DraftMode>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftIsPrivate, setDraftIsPrivate] = useState(true);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftSearchResults, setDraftSearchResults] = useState<ChatUserSearchResult[]>([]);
  const [draftMembers, setDraftMembers] = useState<ChatUserSearchResult[]>([]);
  const [manageSearch, setManageSearch] = useState("");
  const [manageResults, setManageResults] = useState<ChatUserSearchResult[]>([]);

  // UI state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  const visibleConversations = useMemo(() => {
    if (filter === "all") return conversations;
    return conversations.filter((item) => item.type === filter);
  }, [conversations, filter]);

  // Load Initial Conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoadingList(true);
        const data = await listConversations("all");
        setConversations(sortConversations(data));
        setActiveId((prev) => prev ?? data[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas.");
      } finally {
        setLoadingList(false);
      }
    }
    loadConversations();
  }, []);

  // Load Active Conversation Details & Messages
  useEffect(() => {
    if (!activeId) {
      setActiveConversation(null);
      setMessages([]);
      setHasMore(false);
      return;
    }

    const conversationId = activeId;
    let cancelled = false;

    async function loadConversation() {
      try {
        setLoadingConversation(true);
        const [details, page] = await Promise.all([
          getConversationDetails(conversationId),
          listConversationMessages(conversationId),
        ]);

        if (cancelled) return;

        setActiveConversation(details);
        setMessages(page.items);
        setHasMore(page.has_more);
        setConversations((prev) => upsertConversation(prev, details));

        const last = page.items[page.items.length - 1];
        if (last) {
          await markConversationRead(conversationId, last.id);
          getChatSocket().emit("chat:markRead", {
            conversationId,
            lastReadMessageId: last.id,
          });
          setConversations((prev) =>
            prev.map((item) => (item.id === conversationId ? { ...item, unread_count: 0 } : item))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar conversa.");
        }
      } finally {
        if (!cancelled) setLoadingConversation(false);
      }
    }

    loadConversation();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Socket.io Listeners
  useEffect(() => {
    const socket = getChatSocket();

    function onMessage(message: ChatMessage) {
      setConversations((prev) => {
        const current = prev.find((item) => item.id === message.conversation_id);
        if (!current) return prev;

        const unread =
          message.conversation_id === activeId || message.sender.email === currentUserEmail
            ? 0
            : current.unread_count + 1;

        return upsertConversation(prev, {
          ...current,
          last_message_preview: message.content,
          last_message_at: message.created_at,
          updated_at: message.created_at,
          unread_count: unread,
        });
      });

      if (message.conversation_id !== activeId) return;

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.sender.email !== currentUserEmail) {
        markConversationRead(message.conversation_id, message.id).catch(() => undefined);
        socket.emit("chat:markRead", {
          conversationId: message.conversation_id,
          lastReadMessageId: message.id,
        });
      }
    }

    function onConversationUpdate(conversation: ChatConversation) {
      setConversations((prev) => upsertConversation(prev, conversation));
      if (conversation.id === activeId) {
        setActiveConversation((prev) => (prev ? { ...prev, ...conversation } : prev));
      }
    }

    function onPresence(payload: { user_id: number; status: string }) {
      setConversations((prev) =>
        prev.map((item) =>
          item.counterpart?.id === payload.user_id
            ? {
                ...item,
                counterpart: { ...item.counterpart, presence_status: payload.status as any },
              }
            : item
        )
      );
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              counterpart:
                prev.counterpart?.id === payload.user_id
                  ? { ...prev.counterpart, presence_status: payload.status as any }
                  : prev.counterpart,
              members: prev.members.map((member) =>
                member.id === payload.user_id
                  ? { ...member, presence_status: payload.status as any }
                  : member
              ),
            }
          : prev
      );
    }

    socket.on("chat:messageCreated", onMessage);
    socket.on("chat:conversationUpdated", onConversationUpdate);
    socket.on("presence:changed", onPresence);

    return () => {
      socket.off("chat:messageCreated", onMessage);
      socket.off("chat:conversationUpdated", onConversationUpdate);
      socket.off("presence:changed", onPresence);
    };
  }, [activeId, currentUserEmail]);

  // Subscribe to active conversation
  useEffect(() => {
    if (!activeId) return;
    const socket = getChatSocket();
    socket.emit("chat:subscribe", { conversationId: activeId });
    return () => {
      socket.emit("chat:unsubscribe", { conversationId: activeId });
    };
  }, [activeId]);

  // Global user search
  useEffect(() => {
    const term = userSearch.trim();
    if (term.length < 2) {
      setUserResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setUserResults(await searchChatUsers(term));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar usuarios.");
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  // Draft search
  useEffect(() => {
    const term = draftSearch.trim();
    if (term.length < 2) {
      setDraftSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchChatUsers(term);
        setDraftSearchResults(
          found.filter((user) => !draftMembers.some((member) => member.id === user.id))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar usuarios.");
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draftSearch, draftMembers]);

  // Manage members search
  useEffect(() => {
    const term = manageSearch.trim();
    if (
      term.length < 2 ||
      !activeConversation ||
      !activeConversation.permissions.can_manage_members ||
      activeConversation.type === "direct"
    ) {
      setManageResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchChatUsers(term);
        setManageResults(
          found.filter(
            (user) => !activeConversation.members.some((member) => member.id === user.id)
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar usuarios.");
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [manageSearch, activeConversation]);

  // Actions
  function resetDraft(nextMode: DraftMode) {
    setDraftMode(nextMode);
    setDraftName("");
    setDraftDescription("");
    setDraftIsPrivate(true);
    setDraftSearch("");
    setDraftSearchResults([]);
    setDraftMembers([]);
  }

  async function submitDraft(event: FormEvent) {
    event.preventDefault();
    if (!draftMode) return;
    try {
      const conversation = await createConversation({
        type: draftMode,
        name: draftName.trim(),
        description: draftDescription.trim(),
        is_private: draftMode === "channel" ? draftIsPrivate : true,
        memberIds: draftMembers.map((member) => member.id),
      });
      setConversations((prev) => upsertConversation(prev, conversation));
      setActiveId(conversation.id);
      resetDraft(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conversa.");
    }
  }

  async function openDirectConversation(user: ChatUserSearchResult) {
    try {
      const conversation = await createDirectConversation(user.id);
      setConversations((prev) => upsertConversation(prev, conversation));
      setActiveId(conversation.id);
      setUserSearch("");
      setUserResults([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir conversa.");
    }
  }

  async function loadOlderMessages() {
    if (!activeId || messages.length === 0) return;
    try {
      setLoadingOlder(true);
      const page = await listConversationMessages(activeId, {
        beforeMessageId: messages[0].id,
      });
      setMessages((prev) => [...page.items, ...prev]);
      setHasMore(page.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar historico.");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function addMember(user: ChatUserSearchResult) {
    if (!activeConversation) return;
    try {
      const updated = await addConversationMembers(activeConversation.id, [user.id]);
      setActiveConversation(updated);
      setConversations((prev) => upsertConversation(prev, updated));
      setManageSearch("");
      setManageResults([]);
      setAddMembersOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar membro.");
    }
  }

  function sendMessage(content: string) {
    if (!activeId || !content.trim()) return;
    getChatSocket().emit("chat:sendMessage", {
      conversationId: activeId,
      content: content.trim(),
      messageType: "text",
    });
  }

  const value = {
    conversations,
    visibleConversations,
    activeId,
    activeConversation,
    messages,
    filter,
    loadingList,
    loadingConversation,
    loadingOlder,
    hasMore,
    error,
    currentUserEmail,
    currentUserName,
    userSearch,
    userResults,
    draftMode,
    draftName,
    draftDescription,
    draftIsPrivate,
    draftSearch,
    draftSearchResults,
    draftMembers,
    manageSearch,
    manageResults,
    detailsOpen,
    addMembersOpen,
    setActiveId,
    setFilter,
    setUserSearch,
    setDetailsOpen,
    setAddMembersOpen,
    setError,
    setDraftName,
    setDraftDescription,
    setDraftIsPrivate,
    setDraftSearch,
    resetDraft,
    addDraftMember: (user: ChatUserSearchResult) => {
      setDraftMembers((prev) => [...prev, user]);
      setDraftSearch("");
      setDraftSearchResults([]);
    },
    removeDraftMember: (userId: number) =>
      setDraftMembers((prev) => prev.filter((item) => item.id !== userId)),
    submitDraft,
    sendMessage,
    loadOlderMessages,
    openDirectConversation,
    addMember,
    setManageSearch,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
