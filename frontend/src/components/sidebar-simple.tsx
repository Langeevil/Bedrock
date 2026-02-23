import React from "react";
import { Link } from "react-router-dom";
import Home from "../assets/icons/DashBoardIcons/Home.png";
import Projects from "../assets/icons/DashBoardIcons/Projects.png";
import Disciplinas from "../assets/icons/DashBoardIcons/Disciplinas.png";
import Chat from "../assets/icons/DashBoardIcons/Chat.png";
import Biblioteca from "../assets/icons/DashBoardIcons/Biblioteca.png";
import Estatica from "../assets/icons/DashBoardIcons/Estatica.png";

type Props = { children?: React.ReactNode };

export function SidebarSimple({ children }: Props) {
  const [openAlert, setOpenAlert] = React.useState(true);

  return (
    <aside className="w-80 min-w-[20rem] z-20 flex h-screen flex-col gap-4 bg-[#18396F] text-white p-4 shadow-2xl">
      {children}

      <div className="mb-2 flex items-center gap-4 p-4">
        <img
          src="https://docs.material-tailwind.com/img/logo-ct-dark.png"
          alt="Logo"
          className="h-8 w-8"
        />
        <h3 className="text-lg font-semibold text-white">Menu Lateral</h3>
      </div>

      <div className="p-2">
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
      </div>

      <nav className="flex-1 overflow-y-auto px-1">
        <ul className="flex flex-col gap-1">
          <li>
            <Link to="/dashboard" className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-white/95 hover:bg-white hover:text-[#0d2145]">
              <div className="flex items-center gap-3">
                <img src={Home} alt="Icone da Home" className="h-5 w-5 object-contain" />
                <span>Home</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to="/projetos" className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-white/95 hover:bg-white hover:text-[#0d2145]">
              <div className="flex items-center gap-3">
                <img src={Projects} alt="Icone de Projetos" className="h-5 w-5 object-contain" />
                <span>Projetos</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to="/disciplinas" className="flex items-center gap-3 rounded-md px-3 py-2 text-white/95 hover:bg-white hover:text-[#0d2145]">
              <img src={Disciplinas} alt="Icone de Disciplinas" className="h-5 w-5 object-contain" />
              <span>Disciplinas</span>
              <span className="ml-auto rounded-full bg-white/90 px-2 py-0.5 text-black text-xs">14</span>
            </Link>
          </li>

          <li className="pt-4">
            <Link to="/chat" className="flex items-center gap-3 rounded-md px-3 py-2 text-white/95 hover:bg-white hover:text-[#0d2145]">
              <img src={Chat} alt="Icone de Chat" className="h-5 w-5 object-contain" />
              <span>Chat</span>
            </Link>
          </li>

          <li>
            <Link to="/biblioteca" className="flex items-center gap-3 rounded-md px-3 py-2 text-white/95 hover:bg-white hover:text-[#0d2145]">
              <img src={Biblioteca} alt="Icone de Biblioteca" className="h-5 w-5 object-contain" />
              <span>Biblioteca</span>
            </Link>
          </li>

          <li>
            <Link to="/estatistica" className="flex items-center gap-3 rounded-md px-3 py-2 text-white/95 hover:bg-white hover:text-[#0d2145]">
              <img src={Estatica} alt="Icone de Estatistica" className="h-5 w-5 object-contain" />
              <span>Estatistica</span>
            </Link>
          </li>

          <li>
            <Link to="/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-white/95 hover:bg-white hover:text-[#0d2145]">
              <svg className="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.4 12.9c.04-.3.06-.6.06-.9s-.02-.6-.06-.9l2.1-1.6c.19-.14.24-.42.12-.63l-2-3.4c-.12-.21-.38-.3-.61-.22l-2.5 1c-.52-.4-1.08-.73-1.69-.98L14.5 2h-5l-.38 2.2c-.61-.25-1.17.57-1.69-.98l-2.5-1c-.23-.09-.49.01-.61.22l-2 3.4c-.12.21-.07.49.12.63L4.6 11.1c-.04.3-.06.6-.06.9s.02.6.06.9L2.5 14.6c-.19-.14-.24-.42-.12-.63l2 3.4c.12.21.38.3.61-.22l2.5-1c.52.4 1.08.73 1.69-.98L9.5 22h5l.38-2.2c.61-.25 1.17-.57 1.69-.98l2.5 1c.23-.09.49-.01-.61-.22l2-3.4c-.12-.21-.07-.49-.12-.63L19.4 13.9z" />
              </svg>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {openAlert && (
        <div className="mt-4 rounded-md border-l-4 border-blue-300 bg-white/90 p-3 text-slate-800">
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
