import type { ChatMessage } from "../types/chatTypes";
import { initials, shortTime } from "../utils/chatFormatters";

export function ChatMessageItem({
  message,
  compact,
}: {
  message: ChatMessage;
  own: boolean;
  compact?: boolean;
}) {
  return (
    <article className={`group flex gap-3 px-6 py-0.5 transition-colors hover:bg-[var(--app-bg-muted)] ${compact ? "mt-0" : "mt-4"}`}>
      <div className="w-10 flex-shrink-0">
        {!compact && (
          <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white shadow-sm">
            {initials(message.sender.nome || message.sender.email)}
          </div>
        )}
        {compact && (
          <div className="flex h-full w-full justify-center pt-1 opacity-0 group-hover:opacity-100">
            <span className="text-[9px] font-medium text-[var(--app-text-muted)]">
              {shortTime(message.created_at)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-[var(--app-text)] transition-colors hover:text-[var(--app-accent)]">
              {message.sender.nome}
            </span>
            <time className="text-[10px] font-semibold uppercase tracking-tight text-[var(--app-text-muted)]" dateTime={message.created_at}>
              {shortTime(message.created_at)}
            </time>
          </div>
        )}

        <div className="relative">
          <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.6] text-[var(--app-text)]">
            {message.content}
          </p>

          {message.edited_at && (
            <span className="ml-1 text-[10px] font-medium italic text-[var(--app-text-muted)]">editada</span>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 self-start pt-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button type="button" aria-label="Reagir a mensagem" className="rounded border border-transparent p-1 text-xs text-[var(--app-text)] hover:border-[var(--app-border)] hover:bg-[var(--app-bg-elevated)]">Reagir</button>
        <button type="button" aria-label="Responder mensagem" className="rounded border border-transparent p-1 text-xs text-[var(--app-text)] hover:border-[var(--app-border)] hover:bg-[var(--app-bg-elevated)]">Responder</button>
        <button type="button" aria-label="Mais opcoes da mensagem" className="rounded border border-transparent p-1 text-xs text-[var(--app-text-muted)] hover:border-[var(--app-border)] hover:bg-[var(--app-bg-elevated)]">Mais</button>
      </div>
    </article>
  );
}
