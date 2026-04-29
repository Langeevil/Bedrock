import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarSimple } from "../../../components/sidebar-simple";
import {
  canAccessAdminAreaForUser,
  canAccessDirectoryForUser,
  canAccessElevatedWorkspace,
  canAccessElevatedWorkspaceForUser,
  canAccessStatisticsForUser,
  shouldShowManagementNavigation,
  subscribeAuthSession,
} from "../../../shared/authSession";
import ProfileModal from "../../auth/components/ProfileModal";
import { getMe } from "../../auth/services/authService";
import type { User } from "../../auth/types/authTypes";
import { getDashboardStats } from "../services/dashboardService";
import type { DashboardStats } from "../types/dashboardTypes";

type ActionCard = {
  title: string;
  description: string;
  href: string;
  label?: string;
};

function buildQuickActions(options: {
  showDirectory: boolean;
  showAdmin: boolean;
}): ActionCard[] {
  return [
    {
      title: "Chat",
      description: "Mensagens, grupos e canais institucionais.",
      href: "/chat",
    },
    {
      title: "Disciplinas",
      description: "Turmas, materiais e atividades acadêmicas.",
      href: "/disciplinas",
    },
    {
      title: "Projetos",
      description: "Planejamento, tarefas e colaboração.",
      href: "/projetos",
    },
    ...(options.showDirectory
      ? [
          {
            title: "Diretório",
            description: "Pessoas, papéis e vínculos institucionais.",
            href: "/diretorio",
          },
        ]
      : []),
    ...(options.showAdmin
      ? [
          {
            title: "Administração",
            description: "Usuários, instituições e governança.",
            href: "/admin",
          },
        ]
      : []),
  ];
}

function buildWorkspaceCards(options: {
  elevated: boolean;
  showStatistics: boolean;
  showAdmin: boolean;
}): ActionCard[] {
  return [
    {
      title: "Biblioteca",
      description: options.elevated
        ? "Consulte livros e acompanhe o acervo institucional."
        : "Consulte livros e acompanhe seus empréstimos.",
      href: "/biblioteca",
      label: "Disponível",
    },
    {
      title: "Configurações",
      description: "Atualize perfil, papel atual e preferências da conta.",
      href: "/settings",
      label: "Conta",
    },
    ...(options.showStatistics
      ? [
          {
            title: "Estatísticas",
            description: "Acompanhe os indicadores principais da base.",
            href: "/estatistica",
            label: "Restrito",
          },
        ]
      : []),
    ...(options.showAdmin
      ? [
          {
            title: "Administração",
            description: "Usuários, instituições e governança.",
            href: "/admin",
            label: "Restrito",
          },
        ]
      : []),
  ];
}

function buildCommonCards(): ActionCard[] {
  return [
    {
      title: "Chat",
      description: "Abra conversas, grupos e canais do ambiente.",
      href: "/chat",
      label: "Mensagens",
    },
    {
      title: "Disciplinas",
      description: "Acompanhe turmas, materiais e atividades.",
      href: "/disciplinas",
      label: "Acadêmico",
    },
    {
      title: "Projetos",
      description: "Organize tarefas, entregas e colaboração.",
      href: "/projetos",
      label: "Workspace",
    },
    {
      title: "Biblioteca",
      description: "Consulte o acervo e seus empréstimos.",
      href: "/biblioteca",
      label: "Acervo",
    },
  ];
}

function StatCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string | number;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
        {title}
      </p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{description}</p>
    </div>
  );
}

export default function DashboardScreen() {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    graduationRate: 0,
  });
  const [showManagementNavigation, setShowManagementNavigation] = useState(() =>
    shouldShowManagementNavigation()
  );
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Workspace");

  const checkUserRole = async () => {
    try {
      const user = await getMe();
      setCurrentUser(user);
      setUserName(user.nome || "Workspace");
      setShowModal(!user.role);
      setShowManagementNavigation(shouldShowManagementNavigation());
    } catch {
      setCurrentUser(null);
      setShowModal(true);
      setShowManagementNavigation(shouldShowManagementNavigation());
    }
  };

  useEffect(() => {
    checkUserRole();
    const unsubscribe = subscribeAuthSession(checkUserRole);
    return () => unsubscribe();
  }, []);

  const showInstitutionalMetrics = currentUser
    ? canAccessElevatedWorkspaceForUser(currentUser)
    : canAccessElevatedWorkspace();
  const showDirectory =
    (currentUser ? canAccessDirectoryForUser(currentUser) : false) &&
    showManagementNavigation;
  const showStatistics = currentUser ? canAccessStatisticsForUser(currentUser) : false;
  const showAdmin =
    (currentUser ? canAccessAdminAreaForUser(currentUser) : false) &&
    showManagementNavigation;

  const quickActions = useMemo(
    () => buildQuickActions({ showDirectory, showAdmin }),
    [showDirectory, showAdmin],
  );
  const workspaceCards = useMemo(
    () =>
      buildWorkspaceCards({
        elevated: showInstitutionalMetrics,
        showStatistics,
        showAdmin,
      }),
    [showInstitutionalMetrics, showStatistics, showAdmin],
  );
  const commonCards = useMemo(() => buildCommonCards(), []);

  useEffect(() => {
    async function loadStats() {
      if (!showInstitutionalMetrics) {
        setError(null);
        return;
      }

      try {
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os indicadores principais.",
        );
      }
    }

    loadStats();
  }, [showInstitutionalMetrics]);

  return (
    <div className="flex h-dvh overflow-hidden">
      <SidebarSimple />

      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}

      <main className="app-page min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
          <section className="rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  Início
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-[var(--app-text)] sm:text-3xl">
                  Olá, {userName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)] sm:text-base">
                  {showInstitutionalMetrics
                    ? "Visão geral do seu ambiente institucional."
                    : "Acesse rapidamente os módulos principais do seu workspace."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/chat"
                  className="btn btn-primary btn-sm min-h-[44px] rounded-xl px-5"
                >
                  Abrir chat
                </Link>
                <Link
                  to="/disciplinas"
                  className="btn btn-outline btn-sm min-h-[44px] rounded-xl px-5"
                >
                  Ver disciplinas
                </Link>
              </div>
            </div>
          </section>

          {error && showInstitutionalMetrics && (
            <div role="alert" className="app-feedback app-feedback-warning">
              <span>{error}</span>
            </div>
          )}

          {showInstitutionalMetrics ? (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Alunos"
                value={stats.totalStudents}
                description="Usuários acadêmicos cadastrados no ambiente atual."
                accent="text-primary"
              />
              <StatCard
                title="Disciplinas"
                value={stats.activeCourses}
                description="Disciplinas ativas disponíveis no workspace."
                accent="text-secondary"
              />
              <StatCard
                title="Perfis completos"
                value={`${stats.graduationRate}%`}
                description="Percentual atual de perfis preenchidos."
                accent="text-accent"
              />
              <StatCard
                title="Biblioteca"
                value="Ativa"
                description="Módulo disponível para livros e empréstimos."
                accent="text-[var(--app-text)]"
              />
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {commonCards.map((card) => (
                <Link
                  key={card.href}
                  to={card.href}
                  className="rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-5 shadow-sm transition hover:border-[var(--app-accent)]/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-semibold text-[var(--app-text)]">{card.title}</p>
                    {card.label && (
                      <span className="rounded-full bg-[var(--app-bg)] px-3 py-1 text-xs font-medium text-[var(--app-text-muted)]">
                        {card.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--app-text-muted)]">
                    {card.description}
                  </p>
                </Link>
              ))}
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--app-text)]">
                    Acesso rápido
                  </h2>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    Atalhos para os módulos mais usados.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 transition hover:border-[var(--app-accent)]/40 hover:shadow-sm"
                  >
                    <p className="font-medium text-[var(--app-text)]">{action.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">
                      {action.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--app-text)]">
                Módulos do ambiente
              </h2>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                Áreas acessíveis a partir da navegação principal.
              </p>

              <div className="mt-5 space-y-3">
                {workspaceCards.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex min-h-[44px] items-start justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 transition hover:border-[var(--app-accent)]/40 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-[var(--app-text)]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                    {item.label && (
                      <span className="rounded-full bg-[var(--app-bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--app-text-muted)]">
                        {item.label}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
