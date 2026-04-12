import type { FormEvent } from "react";
import type { ChatUserSearchResult } from "../types/chatTypes";
import type { DraftMode } from "../utils/chatFormatters";

export function ChatCreateConversationModal({
  mode,
  name,
  description,
  isPrivate,
  search,
  searchResults,
  members,
  onClose,
  onSubmit,
  onNameChange,
  onDescriptionChange,
  onPrivateChange,
  onSearchChange,
  onAddMember,
  onRemoveMember,
}: {
  mode: DraftMode;
  name: string;
  description: string;
  isPrivate: boolean;
  search: string;
  searchResults: ChatUserSearchResult[];
  members: ChatUserSearchResult[];
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPrivateChange: (value: boolean) => void;
  onSearchChange: (value: string) => void;
  onAddMember: (user: ChatUserSearchResult) => void;
  onRemoveMember: (userId: number) => void;
}) {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-create-conversation-title"
        onSubmit={onSubmit}
        className="w-full max-w-xl rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 text-[var(--app-text)] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              {mode === "group" ? "Novo grupo" : "Novo canal"}
            </p>
            <h2 id="chat-create-conversation-title" className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
              Criar {mode === "group" ? "grupo" : "canal"}
            </h2>
          </div>
          <button type="button" aria-label="Fechar criacao de conversa" onClick={onClose} className="rounded-xl border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-bg-muted)]">
            Fechar
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <input
            aria-label="Nome da conversa"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nome da conversa"
            className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
          />
          <textarea
            aria-label="Descricao da conversa"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Descricao opcional"
            rows={3}
            className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
          />
          {mode === "channel" && (
            <label className="flex items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text)]">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => onPrivateChange(event.target.checked)}
              />
              Canal privado
            </label>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]">Membros</label>
            <input
              aria-label="Buscar membros"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar usuarios"
              className="mt-2 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-4 py-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] p-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  aria-label={`Adicionar ${user.nome} a conversa`}
                  onClick={() => onAddMember(user)}
                  className="flex w-full items-center justify-between rounded-xl bg-[var(--app-bg-elevated)] px-3 py-2 text-left hover:bg-[var(--app-bg-muted)]"
                >
                  <span className="text-sm font-semibold text-[var(--app-text)]">{user.nome}</span>
                  <span className="text-xs text-[var(--app-text-muted)]">{user.email}</span>
                </button>
              ))}
            </div>
          )}

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  aria-label={`Remover ${member.nome} da conversa`}
                  onClick={() => onRemoveMember(member.id)}
                  className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-800"
                >
                  {member.nome} x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-[var(--app-border)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-bg-muted)]">
            Cancelar
          </button>
          <button type="submit" className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Criar
          </button>
        </div>
      </form>
    </div>
  );
}
