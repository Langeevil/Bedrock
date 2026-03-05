import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { SidebarSimple } from "../components/sidebar-simple";
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
  type ChatConversation,
  type ChatConversationDetails,
  type ChatMessage,
  type ChatUserSearchResult,
  type ConversationType,
} from "../services/chatService";

type FilterMode = "all" | ConversationType;
type DraftMode = "group" | "channel" | null;

function sortConversations(items: ChatConversation[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });
}

function upsertConversation(items: ChatConversation[], next: ChatConversation) {
  const found = items.some((item) => item.id === next.id);
  const merged = found
    ? items.map((item) => (item.id === next.id ? { ...item, ...next } : item))
    : [next, ...items];
  return sortConversations(merged);
}

function conversationName(conversation: ChatConversation | null) {
  if (!conversation) return "Selecione uma conversa";
  if (conversation.type === "direct") {
    return conversation.counterpart?.nome || conversation.counterpart?.email || "Conversa direta";
  }
  return conversation.name || "Conversa sem nome";
}

function conversationMeta(conversation: ChatConversation | null) {
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

function shortTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const currentUserEmail = localStorage.getItem("user_email") || "";
  const currentUserName = localStorage.getItem("user_nome") || "Usuário";
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
  const [messageText, setMessageText] = useState("");
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
  const endRef = useRef<HTMLDivElement | null>(null);

  const visibleConversations = useMemo(() => {
    if (filter === "all") return conversations;
    return conversations.filter((item) => item.type === filter);
  }, [conversations, filter]);

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

  useEffect(() => {
    if (!activeId) return;
    const socket = getChatSocket();
    socket.emit("chat:subscribe", { conversationId: activeId });
    return () => {
      socket.emit("chat:unsubscribe", { conversationId: activeId });
    };
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar membro.");
    }
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!activeId) return;

    const content = messageText.trim();
    if (!content) return;

    getChatSocket().emit("chat:sendMessage", {
      conversationId: activeId,
      content,
      messageType: "text",
    });
    setMessageText("");
  }

  return (
    <div className="flex h-screen">
      <SidebarSimple />
      <div className="flex-grow overflow-hidden bg-[#f4f7fc] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Chat Workspace</h1>
            <p className="text-sm text-slate-500">
              Bem-vindo(a), <span className="font-semibold text-slate-700">{currentUserName}</span> • {currentUserEmail}
            </p>
          </div>
          {error && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
              {error}
            </div>
          )}
        </div>

        <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)] xl:grid-rows-[auto_minmax(0,1fr)]">
          <section className="order-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-start-1 xl:row-start-1">
            <div className="order-1 border-b border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Acoes Rapidas</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => resetDraft("group")}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Novo grupo
                </button>
                <button
                  type="button"
                  onClick={() => resetDraft("channel")}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Novo canal
                </button>
              </div>
            </div>

            <div className="order-2 border-b border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nova DM</p>
              <input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Buscar usuario por e-mail"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="order-3 max-h-52 overflow-y-auto border-b border-slate-200 p-3">
              {userSearch.trim().length >= 2 && userResults.length === 0 && (
                <p className="text-sm text-slate-500">Nenhum usuario encontrado.</p>
              )}
              {userResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => openDirectConversation(user)}
                  className="mb-2 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="font-medium text-slate-800">{user.nome}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className="text-[11px] uppercase text-slate-400">
                    {user.presence_status || "offline"}
                  </span>
                </button>
              ))}
            </div>

            <div className="order-4 border-b border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtros</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {(["all", "direct", "group", "channel"] as FilterMode[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full border px-3 py-1 ${
                      filter === value
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {value === "all" ? "Todas" : value}
                  </button>
                ))}
              </div>
            </div>

            <div className="order-5 flex-1 overflow-y-auto bg-slate-50/70 p-4">
              {draftMode ? (
                <form onSubmit={submitDraft} className="space-y-3">
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Nome da conversa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <textarea
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    placeholder="Descricao opcional"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  {draftMode === "channel" && (
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={draftIsPrivate}
                        onChange={(event) => setDraftIsPrivate(event.target.checked)}
                      />
                      Canal privado
                    </label>
                  )}
                  <input
                    value={draftSearch}
                    onChange={(event) => setDraftSearch(event.target.value)}
                    placeholder="Adicionar membros"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  {draftSearchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setDraftMembers((prev) => [...prev, user]);
                        setDraftSearch("");
                        setDraftSearchResults([]);
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm text-slate-700">{user.nome}</span>
                      <span className="text-xs text-slate-400">{user.email}</span>
                    </button>
                  ))}
                  {draftMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {draftMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() =>
                            setDraftMembers((prev) => prev.filter((item) => item.id !== member.id))
                          }
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                        >
                          {member.nome} x
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button type="submit" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => resetDraft(null)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Use a busca para abrir uma DM ou crie um grupo/canal.
                </div>
              )}
            </div>
          </section>

          <section className="order-2 flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-start-1 xl:row-start-2">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">Conversas</h2>
                  <p className="text-xs text-slate-500">
                    {visibleConversations.length} item{visibleConversations.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Inbox
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingList && <p className="px-2 py-3 text-sm text-slate-500">Carregando conversas...</p>}
              {!loadingList && visibleConversations.length === 0 && (
                <p className="px-2 py-3 text-sm text-slate-500">Nenhuma conversa encontrada.</p>
              )}
              <div className="space-y-2">
                {visibleConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      conversation.id === activeId
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {conversationName(conversation).slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">{conversationName(conversation)}</p>
                            <p className="truncate text-xs text-slate-500">{conversationMeta(conversation)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">
                          {shortTime(conversation.last_message_at || conversation.updated_at)}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="mt-1 inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 truncate text-sm text-slate-600">
                      {conversation.last_message_preview || "Sem mensagens ainda"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="order-3 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-start-2 xl:row-span-2">
            <div className="grid h-full grid-cols-1">
              <div className="flex min-w-0 flex-col">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-slate-900">
                        {conversationName(activeConversation)}
                      </h2>
                      {activeConversation && (
                        <p className="truncate text-sm text-slate-500">
                          {conversationMeta(activeConversation)}
                          {activeConversation.type === "direct" && activeConversation.counterpart?.presence_status
                            ? ` - ${activeConversation.counterpart.presence_status}`
                            : ""}
                        </p>
                      )}
                    </div>
                    {activeConversation && (
                      <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Ativa</p>
                        <p className="text-sm font-medium text-slate-700">
                          {activeConversation.member_count} membros
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-4">
                  {!activeConversation && (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                      Selecione uma conversa, abra uma DM por e-mail ou crie um grupo/canal.
                    </div>
                  )}

                  {activeConversation && (
                    <>
                      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Membros
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {activeConversation.members.length} participante
                              {activeConversation.members.length === 1 ? "" : "s"}
                            </p>
                          </div>
                          {activeConversation.permissions.can_manage_members &&
                            activeConversation.type !== "direct" && (
                              <div className="w-full max-w-xs">
                                <input
                                  value={manageSearch}
                                  onChange={(event) => setManageSearch(event.target.value)}
                                  placeholder="Adicionar membros"
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                                />
                              </div>
                            )}
                        </div>

                        {manageResults.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {manageResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => addMember(user)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:border-blue-300"
                              >
                                <span className="truncate text-slate-700">{user.nome}</span>
                                <span className="text-[11px] text-slate-400">Adicionar</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {activeConversation.members.map((member) => (
                            <div
                              key={member.id}
                              className="min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {member.nome}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                                </div>
                                <span className="text-[11px] uppercase text-slate-400">
                                  {member.member_role}
                                </span>
                              </div>
                              <p className="mt-2 text-[11px] text-slate-400">
                                {member.presence_status || "offline"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {hasMore && (
                        <div className="mb-4 flex justify-center">
                          <button
                            type="button"
                            onClick={loadOlderMessages}
                            disabled={loadingOlder}
                            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-60"
                          >
                            {loadingOlder ? "Carregando..." : "Carregar mensagens antigas"}
                          </button>
                        </div>
                      )}
                      {loadingConversation && <p className="text-sm text-slate-500">Carregando conversa...</p>}
                      {!loadingConversation && messages.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                          Ainda nao ha mensagens nesta conversa.
                        </div>
                      )}
                      <div className="space-y-3">
                        {messages.map((message) => {
                          const own = message.sender.email === currentUserEmail;
                          return (
                            <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                                  own
                                    ? "bg-blue-600 text-white"
                                    : "border border-slate-200 bg-white text-slate-900"
                                }`}
                              >
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className={`text-xs font-semibold ${own ? "text-blue-100" : "text-slate-500"}`}>
                                    {message.sender.nome || message.sender.email}
                                  </span>
                                  <span className={`text-[11px] ${own ? "text-blue-100" : "text-slate-400"}`}>
                                    {shortTime(message.created_at)}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div ref={endRef} />
                    </>
                  )}
                </div>

                <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white px-5 py-4">
                  <div className="flex gap-3">
                    <input
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      placeholder={activeConversation ? "Digite sua mensagem" : "Selecione uma conversa"}
                      disabled={!activeConversation}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!activeConversation}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>

              <aside className="hidden">
                <div className="border-b border-slate-200 px-4 py-4">
                  <h3 className="font-semibold text-slate-900">Membros</h3>
                  <p className="text-xs text-slate-500">
                    {activeConversation ? `${activeConversation.members.length} participantes` : "Sem conversa"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {activeConversation?.permissions.can_manage_members &&
                    activeConversation.type !== "direct" && (
                      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <input
                          value={manageSearch}
                          onChange={(event) => setManageSearch(event.target.value)}
                          placeholder="Adicionar membros"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                        />
                        <div className="mt-3 space-y-2">
                          {manageResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => addMember(user)}
                              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-blue-300"
                            >
                              <span className="truncate text-slate-700">{user.nome}</span>
                              <span className="text-[11px] text-slate-400">Adicionar</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="space-y-2">
                    {activeConversation?.members.map((member) => (
                      <div key={member.id} className="rounded-2xl border border-slate-200 px-3 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{member.nome}</p>
                            <p className="truncate text-xs text-slate-500">{member.email}</p>
                          </div>
                          <span className="text-[11px] uppercase text-slate-400">{member.member_role}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{member.presence_status || "offline"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
