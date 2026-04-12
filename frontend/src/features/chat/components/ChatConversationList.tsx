import type { ChatConversation, ConversationType } from "../types/chatTypes";
import type { FilterMode } from "../utils/chatFormatters";
import { conversationTypeLabel } from "../utils/chatFormatters";
import { ChatConversationListItem } from "./ChatConversationListItem";

const sections: Array<{ type: ConversationType; label: string }> = [
  { type: "direct", label: "DMs" },
  { type: "group", label: "Grupos" },
  { type: "channel", label: "Canais" },
];

export function ChatConversationList({
  conversations,
  activeId,
  filter,
  loading,
  onSelect,
}: {
  conversations: ChatConversation[];
  activeId: number | null;
  filter: FilterMode;
  loading: boolean;
  onSelect: (id: number) => void;
}) {
  if (loading) {
    return <p className="px-2 py-3 text-sm text-[var(--app-text-muted)]">Carregando conversas...</p>;
  }

  if (conversations.length === 0) {
    return <p className="px-2 py-3 text-sm text-[var(--app-text-muted)]">Nenhuma conversa encontrada.</p>;
  }

  if (filter !== "all") {
    return (
      <div className="w-full min-w-0 space-y-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          {conversationTypeLabel(filter)}
        </p>
        <div className="w-full min-w-0 space-y-2">
          {conversations.map((conversation) => (
            <ChatConversationListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5">
      {sections.map((section) => {
        const items = conversations.filter((conversation) => conversation.type === section.type);
        if (items.length === 0) return null;

        return (
          <section key={section.type} className="w-full min-w-0 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                {section.label}
              </p>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--app-text-muted)]">
                {items.length}
              </span>
            </div>
            <div className="w-full min-w-0 space-y-2">
              {items.map((conversation) => (
                <ChatConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
