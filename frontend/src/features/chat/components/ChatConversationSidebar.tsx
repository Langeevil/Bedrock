import { useChat } from "../context/ChatContext";
import { ChatConversationList } from "./ChatConversationList";
import type { FilterMode } from "../utils/chatFormatters";

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
    openDirectConversation,
    setActiveId,
    resetDraft,
    setFilter
  } = useChat();

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col select-none overflow-hidden bg-[var(--app-bg-elevated)] text-[var(--app-text)]">
      {/* Topo: Título e Ações Rápidas */}
      <div className="border-b border-[var(--app-border)] p-4">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[var(--app-text)]">Chat</h2>
          <div className="flex shrink-0 gap-2">
            <button 
              type="button"
              onClick={() => resetDraft("group")}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--app-text-muted)] transition-colors hover:border-[var(--app-accent)] hover:text-[var(--app-text)]"
            >
              GRUPO
            </button>
            <button 
              type="button"
              onClick={() => resetDraft("channel")}
              className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              CANAL
            </button>
          </div>
        </div>

        {/* Filtros de Categoria */}
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

        {/* Busca Unificada */}
        <div className="relative min-w-0">
          <input
            aria-label="Filtrar conversas ou iniciar mensagem direta"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Filtrar ou iniciar DM..."
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-2 text-sm text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:bg-[var(--app-bg-elevated)] focus:ring-4 focus:ring-blue-500/10"
          />
          {userSearch && (
            <button 
              type="button"
              aria-label="Limpar busca"
              onClick={() => setUserSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            >
              <span className="text-[10px]">✕</span>
            </button>
          )}

          {/* Resultados de Busca de Usuários (Overlay) */}
          {userSearch.trim().length >= 2 && userResults.length > 0 && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-2 shadow-2xl">
              <p className="px-3 py-2 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Pessoas sugeridas</p>
              {userResults.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  aria-label={`Abrir conversa direta com ${user.nome}`}
                  onClick={() => openDirectConversation(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[var(--app-bg-muted)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold text-indigo-600">
                    {user.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--app-text)]">{user.nome}</p>
                    <p className="truncate text-[11px] text-[var(--app-text-muted)]">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Conversas Organizada */}
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-[var(--app-border)] px-3 py-4 scrollbar-thin scrollbar-thumb-slate-300">
        <div className="w-full min-w-0 space-y-5">
          {/* Seção: Atenção */}
          {visibleConversations.some(c => c.unread_count > 0) && (
            <div className="w-full min-w-0">
              <div className="mb-2 flex items-center px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-accent)]">Não lidas</h3>
                <div className="ml-2 h-px flex-1 bg-[var(--app-border)]" />
              </div>
              <ChatConversationList
                conversations={visibleConversations.filter(c => c.unread_count > 0)}
                activeId={activeId}
                filter={filter}
                loading={loadingList}
                onSelect={setActiveId}
              />
            </div>
          )}

          {/* Seção: Recentes */}
          <div className="w-full min-w-0">
            <div className="mb-2 flex items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Conversas</h3>
              <div className="ml-2 h-px flex-1 bg-[var(--app-border)]" />
            </div>
            <ChatConversationList
              conversations={visibleConversations.filter(c => c.unread_count === 0)}
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
