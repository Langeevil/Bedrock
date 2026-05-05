import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  Video,
} from "lucide-react";
import type { Discipline } from "../services/disciplinesService";
import type { TabKey } from "../types/disciplineTypes";

const TABS: { id: TabKey; label: string }[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "materials", label: "Arquivos" },
  { id: "tasks", label: "Tarefas" },
  { id: "chat", label: "Publicações" },
  { id: "members", label: "Membros" },
  { id: "meeting", label: "Reunião" },
  { id: "settings", label: "Configurações" },
];

const ACTION_BTNS = [
  { id: "meeting", label: "Reunião", Icon: Video },
  { id: "call", label: "Ligar", Icon: Phone },
  { id: "search", label: "Buscar", Icon: Search },
  { id: "notifications", label: "Notificações", Icon: Bell },
  { id: "favorite", label: "Favoritar", Icon: Star },
  { id: "more", label: "Mais", Icon: MoreHorizontal },
];

interface Props {
  discipline: Discipline;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function DisciplineHeader({
  discipline,
  activeTab,
  onTabChange,
}: Readonly<Props>) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 py-3 text-xs text-[var(--app-text-muted)]">
          <button
            type="button"
            onClick={() => navigate("/disciplinas")}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-2 text-[var(--app-accent)] transition hover:bg-[var(--app-bg-muted)]"
          >
            <ChevronLeft size={14} />
            Disciplinas
          </button>
          <span>/</span>
          <span className="truncate">{discipline.name}</span>
        </div>

        <div className="flex flex-col gap-4 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)] text-[var(--app-accent-contrast)] shadow-sm">
              <BookOpen size={20} />
            </div>

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-[var(--app-text)] sm:text-xl">
                {discipline.name}
              </div>
              <div className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                {discipline.code} · {discipline.professor}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ACTION_BTNS.map(({ id, label, Icon }) => {
              const isEnabled = id === "meeting";

              return (
                <button
                  key={id}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => {
                    if (isEnabled) onTabChange("meeting");
                  }}
                  disabled={!isEnabled}
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--app-border)] px-3 transition ${
                    isEnabled
                      ? "bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:bg-[var(--app-bg-muted)] hover:text-[var(--app-text)]"
                      : "cursor-default bg-[var(--app-bg)] text-[var(--app-text-muted)] opacity-50"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`min-h-[44px] whitespace-nowrap border-b-2 px-3 py-2 text-sm transition ${
                  active
                    ? "border-[var(--app-accent)] font-semibold text-[var(--app-accent)]"
                    : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
