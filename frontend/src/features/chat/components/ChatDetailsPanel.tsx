import type { ChatConversationDetails } from "../types/chatTypes";
import { conversationMeta, conversationName, initials, presenceDotClass, presenceLabel } from "../utils/chatFormatters";

export function ChatDetailsPanel({
  conversation,
  onOpenAddMembers,
}: {
  conversation: ChatConversationDetails | null;
  onOpenAddMembers: () => void;
}) {
  if (!conversation) {
    return (
      <div className="flex h-full flex-col justify-center p-6 text-center">
        <p className="text-lg font-semibold text-[var(--app-text)]">Detalhes</p>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">Selecione uma conversa para ver membros e informacoes.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--app-border)] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            {initials(conversationName(conversation))}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[var(--app-text)]">{conversationName(conversation)}</h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">{conversationMeta(conversation)}</p>
          </div>
        </div>
        {conversation.description && (
          <p className="mt-4 rounded-2xl bg-[var(--app-bg-muted)] p-3 text-sm text-[var(--app-text-muted)]">{conversation.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[var(--app-text)]">Membros</p>
          <p className="text-xs text-[var(--app-text-muted)]">{conversation.members.length} participantes</p>
        </div>
        {conversation.permissions.can_manage_members && conversation.type !== "direct" && (
          <button
            type="button"
            onClick={onOpenAddMembers}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Adicionar
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--app-bg-muted)] p-4">
        {conversation.members.map((member) => (
          <div key={member.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="relative">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                  {initials(member.nome || member.email)}
                </span>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--app-bg-elevated)] ${presenceDotClass(member.presence_status)}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--app-text)]">{member.nome}</p>
                <p className="truncate text-xs text-[var(--app-text-muted)]">{member.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--app-bg-muted)] px-2 py-0.5 text-[11px] font-semibold uppercase text-[var(--app-text-muted)]">
                    {member.member_role}
                  </span>
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--app-accent)_14%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--app-accent)]">
                    {presenceLabel(member.presence_status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
