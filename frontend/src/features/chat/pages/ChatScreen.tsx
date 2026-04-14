import { useRef, useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { ChatAddMembersModal } from "../components/ChatAddMembersModal";
import { ChatComposer } from "../components/ChatComposer";
import { ChatConversationSidebar } from "../components/ChatConversationSidebar";
import { ChatDetailsPanel } from "../components/ChatDetailsPanel";
import { ChatHeader } from "../components/ChatHeader";
import { ChatLayout } from "../components/ChatLayout";
import { ChatMessageList } from "../components/ChatMessageList";
import { ChatProvider, useChat } from "../context/ChatContext";

function ChatContent() {
  const {
    activeConversation,
    messages,
    loadingConversation,
    loadingOlder,
    hasMore,
    currentUserEmail,
    manageSearch,
    manageResults,
    detailsOpen,
    addMembersOpen,
    setDetailsOpen,
    setAddMembersOpen,
    sendMessage,
    loadOlderMessages,
    addMember,
    setManageSearch,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const detailsPanel = (
    <ChatDetailsPanel
      conversation={activeConversation}
      onOpenAddMembers={() => setAddMembersOpen(true)}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarSimple />
      
      <div className="min-w-0 flex-1 overflow-hidden bg-[#f4f7fc] p-2 sm:p-4">
        <div className="h-full">
          <ChatLayout
            rail={null}
            sidebar={
              <ChatConversationSidebar />
            }
            main={
              <div className="flex h-full min-h-0 flex-col">
                <ChatHeader
                  conversation={activeConversation}
                  onOpenDetails={() => setDetailsOpen(true)}
                />
                <ChatMessageList
                  conversation={activeConversation}
                  messages={messages}
                  currentUserEmail={currentUserEmail}
                  hasMore={hasMore}
                  loadingConversation={loadingConversation}
                  loadingOlder={loadingOlder}
                  endRef={endRef}
                  onLoadOlder={loadOlderMessages}
                />
                <ChatComposer
                  conversation={activeConversation}
                  value={messageText}
                  onChange={setMessageText}
                  onSubmit={handleSendMessage}
                />
              </div>
            }
          />
        </div>
      </div>

      {detailsOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes da conversa"
            className="h-full w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Membros e detalhes</p>
              <button
                type="button"
                aria-label="Fechar detalhes da conversa"
                onClick={() => setDetailsOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              >
                Fechar
              </button>
            </div>
            {detailsPanel}
          </div>
        </div>
      )}

      <ChatAddMembersModal
        open={addMembersOpen}
        conversation={activeConversation}
        search={manageSearch}
        results={manageResults}
        onSearchChange={setManageSearch}
        onAddMember={addMember}
        onClose={() => {
          setAddMembersOpen(false);
          setManageSearch("");
        }}
      />
    </div>
  );
}

export default function ChatScreen() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
