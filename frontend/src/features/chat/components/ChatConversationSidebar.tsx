import { useEffect, useMemo, useState } from "react";
import { useChat } from "../context/ChatContext";
import type { ChatUserSearchResult } from "../types/chatTypes";
import {
  conversationMeta,
  conversationName,
  type FilterMode,
} from "../utils/chatFormatters";
import { ChatConversationList } from "./ChatConversationList";

const filterOptions: { mode: FilterMode; label: string }[] = [
  { mode: "all", label: "Tudo" },
  { mode: "direct", label: "Diretas" },
  { mode: "group", label: "Grupos" },
  { mode: "channel", label: "Canais" },
];

export function ChatConversationSidebar() {
  const {
    visibleConversations,
    activeId,
    filter,
    loadingList,
    userSearch,
    userResults,
    setUserSearch,
    setActiveId,
    startConversationWithUsers,
    setFilter,
  } = useChat();
  const [selectedUsers, setSelectedUsers] = useState<ChatUserSearchResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const searchTerm = userSearch.trim().toLowerCase();
  const selectedUserIds = useMemo(() => new Set(selectedUsers.map((user) => user.id)), [selectedUsers]);
  const suggestedUsers = userResults.filter((user) => !selectedUserIds.has(user.id));
  const highlightedUser = suggestedUsers[highlightedIndex];
  const displayedConversations = useMemo(() => {
    if (selectedUsers.length > 0 || !searchTerm) return visibleConversations;

    return visibleConversations.filter((conversation) => {
      const values = [
        conversationName(conversation),
        conversationMeta(conversation),
        conversation.last_message_preview || "",
      ];
      return values.some((value) => value.toLowerCase().includes(searchTerm));
    });
  }, [searchTerm, selectedUsers.length, visibleConversations]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [userSearch, suggestedUsers.length]);

  function addSelectedUser(user: ChatUserSearchResult) {
    setSelectedUsers((current) =>
      current.some((item) => item.id === user.id) ? current : [...current, user]
    );
    setUserSearch("");
    setSuggestionsOpen(false);
  }

  function removeSelectedUser(userId: number) {
    setSelectedUsers((current) => current.filter((user) => user.id !== userId));
  }

  async function confirmSelectedUsers() {
    if (selectedUsers.length === 0) return;
    await startConversationWithUsers(selectedUsers);
    setSelectedUsers([]);
    setUserSearch("");
    setSuggestionsOpen(false);
  }

  function clearSearchFlow() {
    setSelectedUsers([]);
    setUserSearch("");
    setSuggestionsOpen(false);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && suggestedUsers.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedIndex((current) => (current + 1) % suggestedUsers.length);
      return;
    }

    if (event.key === "ArrowUp" && suggestedUsers.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setHighlightedIndex((current) => (current - 1 + suggestedUsers.length) % suggestedUsers.length);
      return;
    }

    if (event.key === "Backspace" && userSearch.length === 0 && selectedUsers.length > 0) {
      event.preventDefault();
      setSelectedUsers((current) => current.slice(0, -1));
      return;
    }

    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (suggestionsOpen && userSearch.trim().length >= 2 && highlightedUser) {
        addSelectedUser(highlightedUser);
        return;
      }
      if (selectedUsers.length > 0) {
        confirmSelectedUsers();
        return;
      }
      if (suggestedUsers.length > 0) {
        addSelectedUser(suggestedUsers[0]);
      }
    }
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col select-none overflow-hidden bg-[var(--app-bg-elevated)] text-[var(--app-text)]">
      <div className="border-b border-[var(--app-border)] p-4">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[var(--app-text)]">Chat</h2>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {filterOptions.map((opt) => (
            <button
              type="button"
              key={opt.mode}
              aria-pressed={filter === opt.mode}
              onClick={() => setFilter(opt.mode)}
              className={`rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                filter === opt.mode
                  ? "bg-[color-mix(in_srgb,var(--app-accent)_14%,transparent)] text-[var(--app-accent)]"
                  : "text-[var(--app-text-muted)] hover:bg-[var(--app-bg-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-0">
          {selectedUsers.length > 0 && (
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--app-accent)]">
              Novo chat
            </p>
          )}
          <div
            className={`flex min-h-11 w-full flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all ${
              selectedUsers.length > 0
                ? "border-[var(--app-accent)] bg-[var(--app-bg-elevated)] ring-4 ring-blue-500/10"
                : "border-[var(--app-border)] bg-[var(--app-bg-muted)] focus-within:border-[var(--app-accent)] focus-within:bg-[var(--app-bg-elevated)] focus-within:ring-4 focus-within:ring-blue-500/10"
            }`}
          >
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--app-accent)_14%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--app-accent)]"
              >
                <span className="max-w-28 truncate">{user.nome || user.email}</span>
                <button
                  type="button"
                  aria-label={`Remover ${user.nome || user.email}`}
                  onClick={() => removeSelectedUser(user.id)}
                  className="rounded-full px-1 hover:bg-[var(--app-bg-muted)]"
                >
                  x
                </button>
              </span>
            ))}
            <input
              aria-label="Buscar conversa ou iniciar chat por nome ou email"
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder={
                selectedUsers.length > 0
                  ? "Adicionar pessoas..."
                  : "Buscar conversa ou iniciar chat por nome/e-mail"
              }
              className="min-w-[8rem] flex-1 bg-transparent text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
            />
            {(userSearch || selectedUsers.length > 0) && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={clearSearchFlow}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-bg-muted)] hover:text-[var(--app-text)]"
              >
                x
              </button>
            )}
            {selectedUsers.length > 0 && (
              <button
                type="button"
                aria-label="Confirmar novo chat"
                onClick={confirmSelectedUsers}
                className="rounded-lg bg-[var(--app-accent)] px-2 py-1 text-xs font-semibold text-white"
              >
                Iniciar
              </button>
            )}
          </div>

          {suggestionsOpen && userSearch.trim().length >= 2 && (
            <div
              role="listbox"
              aria-label="Sugestoes de usuarios"
              className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-2 shadow-2xl"
            >
              <p className="px-3 py-2 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                Pessoas sugeridas
              </p>
              {suggestedUsers.length === 0 && (
                <p className="rounded-xl px-3 py-2 text-sm text-[var(--app-text-muted)]">
                  Nenhuma pessoa encontrada.
                </p>
              )}
              {suggestedUsers.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  role="option"
                  aria-selected={highlightedUser?.id === user.id}
                  aria-label={`Selecionar ${user.nome}`}
                  onClick={() => addSelectedUser(user)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    highlightedUser?.id === user.id
                      ? "bg-[var(--app-bg-muted)]"
                      : "hover:bg-[var(--app-bg-muted)]"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold text-indigo-600">
                    {user.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--app-text)]">{user.nome}</p>
                    <p className="truncate text-[11px] text-[var(--app-text-muted)]">
                      {user.organization_name ? `${user.email} - ${user.organization_name}` : user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-[var(--app-border)] px-3 py-4 scrollbar-thin scrollbar-thumb-slate-300">
        <div className="w-full min-w-0 space-y-5">
          {displayedConversations.some((conversation) => conversation.unread_count > 0) && (
            <div className="w-full min-w-0">
              <div className="mb-2 flex items-center px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-accent)]">
                  Nao lidas
                </h3>
                <div className="ml-2 h-px flex-1 bg-[var(--app-border)]" />
              </div>
              <ChatConversationList
                conversations={displayedConversations.filter((conversation) => conversation.unread_count > 0)}
                activeId={activeId}
                filter={filter}
                loading={loadingList}
                onSelect={setActiveId}
              />
            </div>
          )}

          <div className="w-full min-w-0">
            <div className="mb-2 flex items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Conversas
              </h3>
              <div className="ml-2 h-px flex-1 bg-[var(--app-border)]" />
            </div>
            <ChatConversationList
              conversations={displayedConversations.filter((conversation) => conversation.unread_count === 0)}
              activeId={activeId}
              filter={filter}
              loading={loadingList}
              onSelect={setActiveId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
