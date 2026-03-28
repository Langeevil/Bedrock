import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserProfile from "../shared/components/UserProfile";
import { canAccessAdminArea, subscribeAuthSession } from "../shared/authSession";
import {
  getStoredThemePreference,
  setThemePreference,
  type ThemePreference,
} from "../shared/theme";
import { getMe } from "../features/auth/services/authService";
import Home from "../assets/icons/DashBoardIcons/Home.png";
import Projects from "../assets/icons/DashBoardIcons/Projects.png";
import Disciplinas from "../assets/icons/DashBoardIcons/Disciplinas.png";
import Chat from "../assets/icons/DashBoardIcons/Chat.png";
import Biblioteca from "../assets/icons/DashBoardIcons/Biblioteca.png";
import Estatica from "../assets/icons/DashBoardIcons/Estatica.png";

type Role = "admin" | "professor" | "aluno";
type Props = { children?: React.ReactNode };

const SIDEBAR_KEY = "bedrock_sidebar_collapsed";

const navItems = [
  {
    to: "/dashboard",
    label: "Home",
    icon: Home,
    alt: "Icone da Home",
    roles: ["admin", "professor", "aluno"] as Role[],
    keywords: ["dashboard", "inicio", "painel", "home"],
  },
  {
    to: "/projetos",
    label: "Projetos",
    icon: Projects,
    alt: "Icone de Projetos",
    roles: ["admin", "professor", "aluno"] as Role[],
    keywords: ["projetos", "project", "tarefas", "planejamento"],
  },
  {
    to: "/disciplinas",
    label: "Disciplinas",
    icon: Disciplinas,
    alt: "Icone de Disciplinas",
    badge: "14",
    roles: ["admin", "professor", "aluno"] as Role[],
    keywords: ["disciplinas", "materias", "turmas", "aulas"],
  },
  {
    to: "/chat",
    label: "Chat",
    icon: Chat,
    alt: "Icone de Chat",
    topGap: true,
    roles: ["admin", "professor", "aluno"] as Role[],
    keywords: ["chat", "mensagens", "conversas", "dm", "grupos", "canais"],
  },
  {
    to: "/biblioteca",
    label: "Biblioteca",
    icon: Biblioteca,
    alt: "Icone de Biblioteca",
    roles: ["admin", "professor", "aluno"] as Role[],
    keywords: ["biblioteca", "livros", "documentos", "conteudo"],
  },
  {
    to: "/estatistica",
    label: "Estatistica",
    icon: Estatica,
    alt: "Icone de Estatistica",
    roles: ["admin", "professor"] as Role[], // aluno NÃO tem acesso
    keywords: ["estatistica", "metricas", "dados", "indicadores"],
  },
];

const settingsItem = {
  to: "/settings",
  label: "Settings",
  roles: ["admin", "professor", "aluno"] as Role[],
  keywords: ["settings", "configuracoes", "perfil", "ajustes"],
};

const adminItem = {
  to: "/admin",
  label: "Administracao",
  keywords: ["admin", "administracao", "usuarios", "instituicoes", "permissoes"],
};

function SettingsIcon() {
  return (
    <svg className="h-6 w-6 text-[color:var(--app-sidebar-contrast)]/80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.4 12.9c.04-.3.06-.6.06-.9s-.02-.6-.06-.9l2.1-1.6c.19-.14.24-.42.12-.63l-2-3.4c-.12-.21-.38-.3-.61-.22l-2.5 1c-.52-.4-1.08-.73-1.69-.98L14.5 2h-5l-.38 2.2c-.61-.25-1.17.57-1.69-.98l-2.5-1c-.23-.09-.49.01-.61.22l-2 3.4c-.12.21-.07.49.12.63L4.6 11.1c-.04.3-.06.6-.06.9s.02.6.06.9L2.5 14.6c-.19-.14-.24-.42-.12-.63l2 3.4c.12.21.38.3.61-.22l2.5-1c.52.4 1.08.73 1.69-.98L9.5 22h5l.38-2.2c.61-.25 1.17-.57 1.69-.98l2.5 1c.23-.09.49-.01-.61-.22l2-3.4c-.12-.21-.07-.49-.12-.63L19.4 13.9z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="h-6 w-6 text-[color:var(--app-sidebar-contrast)]/80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l7 4v6c0 5-3.5 8.74-7 10-3.5-1.26-7-5-7-10V6l7-4Zm0 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4Zm-3 8h6v-1.5c0-1.38-1.79-2.5-3-2.5s-3 1.12-3 2.5V15Z" />
    </svg>
  );
}

function NavItem({
  to,
  label,
  collapsed,
  badge,
  topGap,
  active,
  children,
}: Readonly<{
  to: string;
  label: string;
  collapsed: boolean;
  badge?: string;
  topGap?: boolean;
  active?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <li className={topGap ? "pt-4" : ""}>
      <Link
        to={to}
        title={collapsed ? label : undefined}
        className={`group flex items-center rounded-md px-3 py-2 transition-all ${
          active
            ? "bg-[var(--app-sidebar-hover)] text-[var(--app-sidebar-hover-text)]"
            : "text-[color:var(--app-sidebar-contrast)]/95 hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
        } ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        {children}
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && badge && (
          <span className="ml-auto rounded-full bg-[var(--app-sidebar-hover)] px-2 py-0.5 text-xs text-[var(--app-sidebar-hover-text)]">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}

export function SidebarSimple({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const [role, setRole] = React.useState<Role>("aluno");

  React.useEffect(() => {
    getMe()
      .then((me) => setRole((me.role as Role) ?? "aluno"))
      .catch(() => setRole("aluno"));
  }, []);

  const [openAlert, setOpenAlert] = React.useState(true);
=======
  const [hasAdminAccess, setHasAdminAccess] = React.useState(() => canAccessAdminArea());
>>>>>>> 4c1be5fa63b342ab7fb587db845caa54fe999570
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "true";
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [themePreference, setThemePreferenceState] = React.useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    return getStoredThemePreference();
  });

  // Filtra os itens de navegação com base no role do usuário
  const visibleNavItems = React.useMemo(
    () => navItems.filter((item) => item.roles.includes(role)),
    [role]
  );

  React.useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  React.useEffect(() => {
    function handleThemeChange() {
      setThemePreferenceState(getStoredThemePreference());
    }

    window.addEventListener("bedrock-theme-change", handleThemeChange);
    return () => window.removeEventListener("bedrock-theme-change", handleThemeChange);
  }, []);

  React.useEffect(() => {
    return subscribeAuthSession(() => {
      setHasAdminAccess(canAccessAdminArea());
    });
  }, []);

  const searchableItems = React.useMemo(
    () =>
<<<<<<< HEAD
      [...visibleNavItems, { ...settingsItem, icon: "", alt: "" }].filter((item) =>
        item.roles.includes(role)
      ),
    [visibleNavItems, role]
=======
      hasAdminAccess
        ? [...navItems, { ...settingsItem, icon: "", alt: "" }, { ...adminItem, icon: "", alt: "" }]
        : [...navItems, { ...settingsItem, icon: "", alt: "" }],
    [hasAdminAccess]
>>>>>>> 4c1be5fa63b342ab7fb587db845caa54fe999570
  );

  const searchResults = React.useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return [];

    return searchableItems.filter((item) => {
      if (item.label.toLowerCase().includes(term)) return true;
      return item.keywords.some((keyword) => keyword.includes(term));
    });
  }, [searchValue, searchableItems]);

  function handleNavigate(path: string) {
    navigate(path);
    setSearchValue("");
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (searchResults.length === 0) return;
    handleNavigate(searchResults[0].to);
  }

  function cycleTheme() {
    const nextTheme: ThemePreference =
      themePreference === "system"
        ? "bedrocklight"
        : themePreference === "bedrocklight"
          ? "bedrockdark"
          : "system";
    setThemePreference(nextTheme);
    setThemePreferenceState(nextTheme);
  }

  function themeLabel() {
    if (themePreference === "system") return "Tema: sistema";
    if (themePreference === "bedrocklight") return "Tema: claro";
    return "Tema: escuro";
  }

  return (
    <aside
      className={`z-20 flex h-screen flex-col gap-4 bg-[var(--app-sidebar)] p-4 text-[var(--app-sidebar-contrast)] shadow-2xl transition-all duration-300 ease-out ${
        collapsed ? "w-24 min-w-[6rem]" : "w-80 min-w-[20rem]"
      }`}
    >
      {children}

      <div className={`mb-2 flex items-center ${collapsed ? "flex-col justify-center gap-3" : "gap-4"} p-2`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} min-w-0`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-sidebar-hover)] text-sm font-semibold text-[var(--app-sidebar-hover-text)]">
            B
          </div>
          {!collapsed && <h3 className="truncate text-lg font-semibold text-[var(--app-sidebar-contrast)]">Menu Lateral</h3>}
        </div>

        {!collapsed && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              title={themeLabel()}
              aria-label={themeLabel()}
              className="rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] p-2 text-[color:var(--app-sidebar-contrast)]/90 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              {themePreference === "bedrockdark" ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2.5" />
                  <path d="M12 19.5V22" />
                  <path d="M4.93 4.93l1.77 1.77" />
                  <path d="M17.3 17.3l1.77 1.77" />
                  <path d="M2 12h2.5" />
                  <path d="M19.5 12H22" />
                  <path d="M4.93 19.07l1.77-1.77" />
                  <path d="M17.3 6.7l1.77-1.77" />
                </svg>
              ) : themePreference === "bedrocklight" ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0A7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 20h8" />
                  <path d="M12 18v2" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Recolher menu lateral"
              className="rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] p-2 text-[color:var(--app-sidebar-contrast)]/90 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              <svg
                className="h-4 w-4 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className={`${collapsed ? "px-0" : "p-2"} transition-all duration-300`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label={themeLabel()}
              title={themeLabel()}
              onClick={cycleTheme}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] text-[color:var(--app-sidebar-contrast)]/80 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              {themePreference === "bedrockdark" ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2.5" />
                  <path d="M12 19.5V22" />
                  <path d="M4.93 4.93l1.77 1.77" />
                  <path d="M17.3 17.3l1.77 1.77" />
                  <path d="M2 12h2.5" />
                  <path d="M19.5 12H22" />
                  <path d="M4.93 19.07l1.77-1.77" />
                  <path d="M17.3 6.7l1.77-1.77" />
                </svg>
              ) : themePreference === "bedrocklight" ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 20h8" />
                  <path d="M12 18v2" />
                </svg>
              )}
            </button>

            <button
              type="button"
              aria-label="Reabrir menu lateral"
              onClick={() => setCollapsed(false)}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] text-[color:var(--app-sidebar-contrast)]/80 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Buscar"
              onClick={() => setCollapsed(false)}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] text-[color:var(--app-sidebar-contrast)]/80 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="6" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Buscar"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-md border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] px-3 py-2 pr-10 text-sm text-[var(--app-sidebar-contrast)] placeholder:text-[color:var(--app-sidebar-contrast)]/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[color:var(--app-sidebar-contrast)]/80 hover:text-[var(--app-sidebar-contrast)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="6" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </form>

            {searchValue.trim() && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-popup)] p-2 shadow-xl">
                {searchResults.length === 0 && (
                  <p className="px-2 py-2 text-sm text-[color:var(--app-sidebar-contrast)]/75">Nenhum resultado encontrado.</p>
                )}

                {searchResults.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => handleNavigate(item.to)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[color:var(--app-sidebar-contrast)]/90 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-[color:var(--app-sidebar-contrast)]/60">{item.to}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-1">
        <ul className="flex flex-col gap-1">
          {visibleNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              collapsed={collapsed}
              badge={item.badge}
              topGap={item.topGap}
              active={location.pathname === item.to}
            >
              <img src={item.icon} alt={item.alt} className="h-6 w-6 shrink-0 object-contain" />
            </NavItem>
          ))}

<<<<<<< HEAD
          {settingsItem.roles.includes(role) && (
            <NavItem
              to={settingsItem.to}
              label={settingsItem.label}
              collapsed={collapsed}
              active={location.pathname === settingsItem.to}
            >
              <SettingsIcon />
=======
          <NavItem
            to={settingsItem.to}
            label={settingsItem.label}
            collapsed={collapsed}
            active={location.pathname === settingsItem.to}
          >
            <SettingsIcon />
          </NavItem>

          {hasAdminAccess && (
            <NavItem
              to={adminItem.to}
              label={adminItem.label}
              collapsed={collapsed}
              active={location.pathname === adminItem.to}
            >
              <AdminIcon />
>>>>>>> 4c1be5fa63b342ab7fb587db845caa54fe999570
            </NavItem>
          )}
        </ul>
      </nav>
      <UserProfile collapsed={collapsed} />
    </aside>
  );
}