import type { FormEvent, KeyboardEvent } from "react";
import type { ChatConversationDetails } from "../types/chatTypes";

export function ChatComposer({
  conversation,
  value,
  onChange,
  onSubmit,
}: {
  conversation: ChatConversationDetails | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!conversation) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="border-t border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-6 pb-6 pt-2">
      <form
        onSubmit={onSubmit}
        className="group relative rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-muted)] transition-all focus-within:border-[var(--app-accent)] focus-within:shadow-md"
      >
        <textarea
          aria-label="Mensagem"
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Digite uma mensagem para ${conversation.name || "esta conversa"}`}
          className="w-full resize-none bg-transparent p-3 text-[14.5px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center justify-between border-t border-transparent px-2 pb-1.5 transition-colors group-focus-within:border-[var(--app-border)]">
          <div className="flex items-center gap-0.5">
            <button type="button" title="Formatar" aria-label="Formatar mensagem" className="rounded p-1.5 text-sm text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text)]">A</button>
            <button type="button" title="Anexar" aria-label="Anexar arquivo" className="rounded p-1.5 text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text)]">Anexar</button>
            <button type="button" title="Emoji" aria-label="Inserir emoji" className="rounded p-1.5 text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text)]">Emoji</button>
            <button type="button" title="Prioridade" aria-label="Marcar mensagem como prioridade" className="rounded p-1.5 text-xs font-bold text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text)]">!</button>
          </div>

          <button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!value.trim()}
            className="rounded-md p-1.5 text-[var(--app-accent)] transition-all hover:bg-[var(--app-bg-elevated)] active:scale-90 disabled:text-[var(--app-text-muted)] disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      </form>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-[var(--app-text-muted)]">
        <span className="font-bold">Enter</span> para enviar, <span className="font-bold">Shift+Enter</span> para nova linha.
      </p>
    </div>
  );
}
