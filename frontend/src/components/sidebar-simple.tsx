import React from "react";
import { Link } from "react-router-dom";
import Home from "../assets/icons/DashBoardIcons/Home.png";
import Projects from "../assets/icons/DashBoardIcons/Projects.png";
import Disciplinas from "../assets/icons/DashBoardIcons/Disciplinas.png";
import Chat from "../assets/icons/DashBoardIcons/Chat.png";
import Biblioteca from "../assets/icons/DashBoardIcons/Biblioteca.png";
import Estatica from "../assets/icons/DashBoardIcons/Estatica.png";

type Props = { children?: React.ReactNode };

const SIDEBAR_KEY = "bedrock_sidebar_collapsed";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home, alt: "Icone da Home" },
  { to: "/projetos", label: "Projetos", icon: Projects, alt: "Icone de Projetos" },
  {
    to: "/disciplinas",
    label: "Disciplinas",
    icon: Disciplinas,
    alt: "Icone de Disciplinas",
    badge: "14",
  },
  { to: "/chat", label: "Chat", icon: Chat, alt: "Icone de Chat", topGap: true },
  { to: "/biblioteca", label: "Biblioteca", icon: Biblioteca, alt: "Icone de Biblioteca" },
  { to: "/estatistica", label: "Estatistica", icon: Estatica, alt: "Icone de Estatistica" },
];

function SettingsIcon() {
  return (
    <svg className="h-6 w-6 text-white/80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.4 12.9c.04-.3.06-.6.06-.9s-.02-.6-.06-.9l2.1-1.6c.19-.14.24-.42.12-.63l-2-3.4c-.12-.21-.38-.3-.61-.22l-2.5 1c-.52-.4-1.08-.73-1.69-.98L14.5 2h-5l-.38 2.2c-.61-.25-1.17.57-1.69-.98l-2.5-1c-.23-.09-.49.01-.61.22l-2 3.4c-.12.21-.07.49.12.63L4.6 11.1c-.04.3-.06.6-.06.9s.02.6.06.9L2.5 14.6c-.19-.14-.24-.42-.12-.63l2 3.4c.12.21.38.3.61-.22l2.5-1c.52.4 1.08.73 1.69-.98L9.5 22h5l.38-2.2c.61-.25 1.17-.57 1.69-.98l2.5 1c.23-.09.49-.01-.61-.22l2-3.4c-.12-.21-.07-.49-.12-.63L19.4 13.9z" />
    </svg>
  );
}

function NavItem({
  to,
  label,
  collapsed,
  badge,
  topGap,
  children,
}: Readonly<{
  to: string;
  label: string;
  collapsed: boolean;
  badge?: string;
  topGap?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <li className={topGap ? "pt-4" : ""}>
      <Link
        to={to}
        title={collapsed ? label : undefined}
        className={`group flex items-center rounded-md px-3 py-2 text-white/95 transition-all hover:bg-white hover:text-[#0d2145] ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        {children}
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && badge && (
          <span className="ml-auto rounded-full bg-white/90 px-2 py-0.5 text-xs text-black">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}

export function SidebarSimple({ children }: Props) {
  const [openAlert, setOpenAlert] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_KEY);
    setCollapsed(saved === "true");
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`z-20 flex h-screen flex-col gap-4 bg-[#18396F] p-4 text-white shadow-2xl transition-all duration-300 ease-out ${
        collapsed ? "w-24 min-w-[6rem]" : "w-80 min-w-[20rem]"
      }`}
    >
      {children}

      <div className={`mb-2 flex items-center ${collapsed ? "flex-col justify-center gap-3" : "gap-4"} p-2`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} min-w-0`}>
          <img
            src="https://docs.material-tailwind.com/img/logo-ct-dark.png"
            alt="Logo"
            className="h-8 w-8 shrink-0"
          />
          {!collapsed && <h3 className="truncate text-lg font-semibold text-white">Menu Lateral</h3>}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Recolher menu lateral"
            className="ml-auto rounded-xl border border-white/15 bg-white/10 p-2 text-white/90 transition hover:bg-white hover:text-[#0d2145]"
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
        )}
      </div>

      <div className={`${collapsed ? "px-0" : "p-2"} transition-all duration-300`}>
        {collapsed ? (
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setCollapsed(false)}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/80 transition hover:bg-white hover:text-[#0d2145]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="6" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
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
            >
              <img src={item.icon} alt={item.alt} className="h-6 w-6 shrink-0 object-contain" />
            </NavItem>
          ))}

          <NavItem to="/settings" label="Settings" collapsed={collapsed}>
            <SettingsIcon />
          </NavItem>
        </ul>
      </nav>

      {openAlert && !collapsed && (
        <div className="mt-4 rounded-md border-l-4 border-blue-300 bg-white/90 p-3 text-slate-800 transition-opacity">
          <div className="flex items-start gap-3">
            <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            <div>
              <h4 className="font-semibold text-slate-900">Upgrade to PRO</h4>
              <p className="text-sm text-slate-700">
                Upgrade to Material Tailwind PRO and get more components, plugins and premium features.
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className="rounded-md bg-transparent px-3 py-1 text-sm text-blue-700 hover:underline"
              onClick={() => setOpenAlert(false)}
            >
              Dismiss
            </button>
            <a className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white" href="#">
              Upgrade Now
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
