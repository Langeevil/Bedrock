import type { ChatConversationDetails } from "../types/chatTypes";
import { conversationMeta, conversationName, initials, presenceDotClass, presenceLabel } from "../utils/chatFormatters";

export function ChatHeader({
  conversation,
  onOpenDetails,
}: {
  conversation: ChatConversationDetails | null;
  onOpenDetails: () => void;
}) {
  const canShowMembers = conversation?.type === "group" || conversation?.type === "channel";

  return (
    <header className="border-b border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-5 py-3 text-[var(--app-text)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {initials(conversationName(conversation))}
            </span>
            {conversation?.type === "direct" && (
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--app-bg-elevated)] ${presenceDotClass(conversation.counterpart?.presence_status)}`} />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-[var(--app-text)]">
              {conversationName(conversation)}
            </h2>
            {conversation ? (
              <p className="truncate text-sm text-[var(--app-text-muted)]">
                {conversationMeta(conversation)}
                {conversation.type === "direct" && conversation.counterpart?.presence_status
                  ? ` - ${presenceLabel(conversation.counterpart.presence_status)}`
                  : ""}
              </p>
            ) : (
              <p className="text-sm text-[var(--app-text-muted)]">Mensagens, canais, grupos e DMs</p>
            )}
          </div>
        </div>

        {canShowMembers && (
          <button
            type="button"
            aria-label="Ver membros da conversa"
            onClick={onOpenDetails}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:border-[var(--app-accent)] hover:bg-[var(--app-bg-elevated)]"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11a4 4 0 1 0-3.46-6A5.95 5.95 0 0 1 14 9c0 .7-.12 1.36-.34 1.98.69.03 1.46.02 2.34.02Zm-8 0a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Zm8.5.3c1.35.82 2.5 1.92 2.5 3.7v2h5v-2c0-2.3-4.1-3.62-7.5-3.7Z" />
            </svg>
            Membros
          </button>
        )}
      </div>
    </header>
  );
}
