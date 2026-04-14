import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserProfile from "../shared/components/UserProfile";
import { canAccessAdminArea, subscribeAuthSession } from "../shared/authSession";
import Home from "../assets/icons/DashBoardIcons/Home.png";
import Projects from "../assets/icons/DashBoardIcons/Projects.png";
import Disciplinas from "../assets/icons/DashBoardIcons/Disciplinas.png";
import Chat from "../assets/icons/DashBoardIcons/Chat.png";
import Biblioteca from "../assets/icons/DashBoardIcons/Biblioteca.png";
import Estatica from "../assets/icons/DashBoardIcons/Estatica.png";

type Props = { children?: React.ReactNode };

const SIDEBAR_KEY = "bedrock_sidebar_collapsed";

type SidebarNavItem = {
  to: string;
  label: string;
  icon: string;
  alt: string;
  keywords: string[];
  badge?: string;
  topGap?: boolean;
};

const navItems: SidebarNavItem[] = [
  {
    to: "/dashboard",
    label: "Home",
    icon: Home,
    alt: "Icone da Home",
    keywords: ["dashboard", "inicio", "painel", "home"],
  },
  {
    to: "/projetos",
    label: "Projetos",
    icon: Projects,
    alt: "Icone de Projetos",
    keywords: ["projetos", "project", "tarefas", "planejamento"],
  },
  {
    to: "/disciplinas",
    label: "Disciplinas",
    icon: Disciplinas,
    alt: "Icone de Disciplinas",
    keywords: ["disciplinas", "materias", "turmas", "aulas"],
  },
  {
    to: "/chat",
    label: "Chat",
    icon: Chat,
    alt: "Icone de Chat",
    topGap: true,
    keywords: ["chat", "mensagens", "conversas", "dm", "grupos", "canais"],
  },
  {
    to: "/biblioteca",
    label: "Biblioteca",
    icon: Biblioteca,
    alt: "Icone de Biblioteca",
    keywords: ["biblioteca", "livros", "documentos", "conteudo"],
  },
  {
    to: "/estatistica",
    label: "Estatistica",
    icon: Estatica,
    alt: "Icone de Estatistica",
    keywords: ["estatistica", "metricas", "dados", "indicadores"],
  },
];

const adminItem = {
  to: "/admin",
  label: "Administracao",
  keywords: ["admin", "administracao", "usuarios", "instituicoes", "permissoes"],
};

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
        } ${collapsed ? "justify-center" : "gap-3"}`}
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
  const [hasAdminAccess, setHasAdminAccess] = React.useState(() => canAccessAdminArea());
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "true";
  });
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1024px)");
    const syncCollapsed = () => {
      if (media.matches) {
        setCollapsed(true);
      }
    };

    syncCollapsed();
    media.addEventListener("change", syncCollapsed);
    return () => media.removeEventListener("change", syncCollapsed);
  }, []);

  React.useEffect(() => {
    return subscribeAuthSession(() => {
      setHasAdminAccess(canAccessAdminArea());
    });
  }, []);

  const searchableItems = React.useMemo(
    () =>
      hasAdminAccess
        ? [...navItems, { ...adminItem, icon: "", alt: "" }]
        : navItems,
    [hasAdminAccess]
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

  return (
    <aside
      className={`z-20 flex h-screen shrink-0 flex-col gap-4 bg-[var(--app-sidebar)] p-3 text-[var(--app-sidebar-contrast)] shadow-2xl transition-all duration-300 ease-out sm:p-4 ${
        collapsed ? "w-20 min-w-20 sm:w-24 sm:min-w-[6rem]" : "w-72 min-w-72 xl:w-80 xl:min-w-[20rem]"
      }`}
    >
      {children}

      <div className={`mb-2 flex items-center ${collapsed ? "flex-col justify-center gap-3" : "gap-4"} p-2`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} min-w-0`}>
          {collapsed ? (
            <button
              type="button"
              aria-label="Expandir menu lateral"
              title="Expandir menu lateral"
              onClick={() => setCollapsed(false)}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-sidebar-hover)] text-sm font-semibold text-[var(--app-sidebar-hover-text)] transition hover:bg-[var(--app-sidebar-surface)]"
            >
              <span className="transition group-hover:hidden group-focus-visible:hidden">B</span>
              <svg
                aria-hidden="true"
                className="hidden h-5 w-5 transition group-hover:block group-focus-visible:block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-sidebar-hover)] text-sm font-semibold text-[var(--app-sidebar-hover-text)]">
              B
            </div>
          )}
          {!collapsed && <h3 className="truncate text-lg font-semibold text-[var(--app-sidebar-contrast)]">Menu Lateral</h3>}
        </div>

        {!collapsed && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Recolher menu lateral"
              className="rounded-xl border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] p-2 text-[color:var(--app-sidebar-contrast)]/90 transition hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-hover-text)]"
            >
              <svg className="h-4 w-4 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                aria-label="Buscar pagina no menu lateral"
                type="text"
                placeholder="Buscar"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-md border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-surface)] px-3 py-2 pr-10 text-sm text-[var(--app-sidebar-contrast)] placeholder:text-[color:var(--app-sidebar-contrast)]/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                aria-label="Executar busca no menu lateral"
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
          {navItems.map((item) => (
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

          {hasAdminAccess && (
            <NavItem
              to={adminItem.to}
              label={adminItem.label}
              collapsed={collapsed}
              active={location.pathname === adminItem.to}
            >
              <AdminIcon />
            </NavItem>
          )}
        </ul>
      </nav>

      <UserProfile collapsed={collapsed} />
    </aside>
  );
}
