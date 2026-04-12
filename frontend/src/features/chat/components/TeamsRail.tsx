import { useChat } from "../context/ChatContext";
import { initials } from "../utils/chatFormatters";

export function TeamsRail() {
  const { currentUserName, currentUserEmail } = useChat();

  const navItems = [
    { id: 'activity', label: 'Atividade', icon: '🔔' },
    { id: 'chat', label: 'Chat', icon: '💬', active: true },
    { id: 'teams', label: 'Equipes', icon: '👥' },
    { id: 'calendar', label: 'Agenda', icon: '📅' },
    { id: 'files', label: 'Arquivos', icon: '📁' },
  ];

  return (
    <div className="flex h-full w-[64px] flex-col items-center bg-slate-900 py-4 text-white">
      {/* Itens de Navegação */}
      <div className="flex flex-col gap-2 w-full">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            title={item.label}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={`group relative flex h-12 w-full items-center justify-center transition-colors ${
              item.active ? "text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {item.active && (
              <div className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-500" />
            )}
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="absolute left-14 hidden rounded bg-slate-800 px-2 py-1 text-xs group-hover:block z-50 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Perfil na Base */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <div
          title={`${currentUserName} (${currentUserEmail})`}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold ring-2 ring-slate-900 transition-all hover:ring-indigo-400"
        >
          {initials(currentUserName)}
        </div>
      </div>
    </div>
  );
}
