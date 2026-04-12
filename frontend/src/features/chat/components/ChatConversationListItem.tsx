import type { ChatConversation } from "../types/chatTypes";
import {
  conversationMeta,
  conversationName,
  initials,
  presenceDotClass,
  shortTime,
  typePillClass,
} from "../utils/chatFormatters";

export function ChatConversationListItem({
  conversation,
  active,
  onSelect,
}: {
  conversation: ChatConversation;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  const name = conversationName(conversation);
  const presence = conversation.counterpart?.presence_status;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`block w-full max-w-full min-w-0 overflow-hidden rounded-2xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:ring-offset-2 focus:ring-offset-[var(--app-bg-elevated)] ${
        active
          ? "border-[var(--app-accent)] bg-[color-mix(in_srgb,var(--app-accent)_12%,var(--app-bg-elevated))] shadow-sm"
          : "border-[var(--app-border)] bg-[var(--app-bg-elevated)] hover:border-[var(--app-accent)] hover:bg-[var(--app-bg-muted)]"
      }`}
    >
      <div className="grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3">
        <div className="relative self-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
            {initials(name)}
          </span>
          {conversation.type === "direct" && (
            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--app-bg-elevated)] ${presenceDotClass(presence)}`} />
          )}
        </div>

        <div className="w-full min-w-0">
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <p className="truncate text-sm font-semibold leading-5 text-[var(--app-text)]">{name}</p>
            <span className="shrink-0 pt-0.5 text-[11px] leading-4 text-[var(--app-text-muted)]">
              {shortTime(conversation.last_message_at || conversation.updated_at)}
            </span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${typePillClass(conversation.type)}`}>
              {conversation.type === "direct" ? "DM" : conversation.type === "group" ? "Grupo" : "Canal"}
            </span>
            <p className="min-w-0 truncate text-xs leading-5 text-[var(--app-text-muted)]">{conversationMeta(conversation)}</p>
          </div>
          <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm leading-5 text-[var(--app-text-muted)]">
              {conversation.last_message_preview || "Sem mensagens ainda"}
            </p>
            {conversation.unread_count > 0 && (
              <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
