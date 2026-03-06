// components/tabs/ChatTab.tsx

import { ChatWindow } from "../chat/ChatWindow";

interface Props {
  disciplineId: number;
}

export function ChatTab({ disciplineId }: Readonly<Props>) {
  return <ChatWindow disciplineId={disciplineId} />;
}