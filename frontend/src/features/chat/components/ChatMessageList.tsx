import type { ChatConversationDetails, ChatMessage } from "../types/chatTypes";
import { ChatMessageGroup } from "./ChatMessageGroup";

function groupMessages(messages: ChatMessage[]) {
  return messages.reduce<ChatMessage[][]>((groups, message) => {
    const previousGroup = groups[groups.length - 1];
    const previousMessage = previousGroup?.[previousGroup.length - 1];
    const sameSender = previousMessage?.sender.email === message.sender.email;

    if (previousGroup && sameSender) {
      previousGroup.push(message);
      return groups;
    }

    groups.push([message]);
    return groups;
  }, []);
}

export function ChatMessageList({
  conversation,
  messages,
  currentUserEmail,
  hasMore,
  loadingConversation,
  loadingOlder,
  endRef,
  onLoadOlder,
}: {
  conversation: ChatConversationDetails | null;
  messages: ChatMessage[];
  currentUserEmail: string;
  hasMore: boolean;
  loadingConversation: boolean;
  loadingOlder: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
  onLoadOlder: () => void;
}) {
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--app-bg-elevated)] p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-bold text-[var(--app-text)]">Bedrock Chat</p>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Selecione uma conversa para iniciar a colaboração institucional.
          </p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessages(messages);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--app-bg-elevated)] px-0 pb-1 pt-3 scrollbar-thin scrollbar-thumb-slate-300">
      {hasMore && (
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="text-xs font-bold text-[var(--app-accent)] transition-colors uppercase tracking-widest hover:underline disabled:opacity-50"
          >
            {loadingOlder ? "Carregando..." : "Carregar histórico de mensagens"}
          </button>
        </div>
      )}

      {loadingConversation && (
        <div className="flex justify-center p-8">
          <span className="animate-pulse text-sm text-[var(--app-text-muted)]">Carregando conversa...</span>
        </div>
      )}

      <div className="pb-6">
        {groupedMessages.map((group) => (
          <ChatMessageGroup
            key={group.map((message) => message.id).join("-")}
            messages={group}
            currentUserEmail={currentUserEmail}
          />
        ))}
      </div>
      <div ref={endRef} />
    </div>
  );
}
