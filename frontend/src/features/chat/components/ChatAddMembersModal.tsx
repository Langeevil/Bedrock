import type { ChatConversationDetails, ChatUserSearchResult } from "../types/chatTypes";
import { conversationName } from "../utils/chatFormatters";

export function ChatAddMembersModal({
  open,
  conversation,
  search,
  results,
  onSearchChange,
  onAddMember,
  onClose,
}: {
  open: boolean;
  conversation: ChatConversationDetails | null;
  search: string;
  results: ChatUserSearchResult[];
  onSearchChange: (value: string) => void;
  onAddMember: (user: ChatUserSearchResult) => void;
  onClose: () => void;
}) {
  if (!open || !conversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-add-members-title"
        className="w-full max-w-lg rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 text-[var(--app-text)] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">Membros</p>
            <h2 id="chat-add-members-title" className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
              Adicionar em {conversationName(conversation)}
            </h2>
          </div>
          <button type="button" aria-label="Fechar adicao de membros" onClick={onClose} className="rounded-xl border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-bg-muted)]">
            Fechar
          </button>
        </div>

        <input
          aria-label="Buscar usuario para adicionar"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar usuario por email ou nome"
          className="mt-6 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
        />

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {search.trim().length >= 2 && results.length === 0 && (
            <p className="rounded-2xl bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text-muted)]">Nenhum usuario disponivel.</p>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              aria-label={`Adicionar ${user.nome}`}
              onClick={() => onAddMember(user)}
              className="flex w-full items-center justify-between rounded-2xl border border-[var(--app-border)] px-4 py-3 text-left hover:border-[var(--app-accent)] hover:bg-[var(--app-bg-muted)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--app-text)]">{user.nome}</span>
                <span className="block truncate text-xs text-[var(--app-text-muted)]">{user.email}</span>
              </span>
              <span className="text-xs font-semibold text-[var(--app-accent)]">Adicionar</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
