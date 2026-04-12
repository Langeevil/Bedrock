import type { ChatMessage } from "../types/chatTypes";
import { ChatMessageItem } from "./ChatMessageItem";

export function ChatMessageGroup({
  messages,
  currentUserEmail,
}: {
  messages: ChatMessage[];
  currentUserEmail: string;
}) {
  return (
    <div className="space-y-1">
      {messages.map((message, index) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          own={message.sender.email === currentUserEmail}
          compact={index > 0}
        />
      ))}
    </div>
  );
}
