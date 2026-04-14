import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type NavbarProps = {
  landingDark?: boolean;
  onToggleLandingTheme?: () => void;
};

const navLinks = [
  { href: "#features", label: "Produtos" },
  { href: "#segments", label: "Planos" },
  { href: "#scale", label: "Solucoes" },
  { href: "#about", label: "Sobre Nos" },
];

export default function Navbar({ landingDark = false, onToggleLandingTheme }: Readonly<NavbarProps>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-[#18396F]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-white">Logo</div>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="font-semibold text-white hover:text-blue-200">
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onToggleLandingTheme}
            className="rounded-3xl border border-white/30 px-4 py-1 font-semibold text-white transition hover:bg-white/10"
          >
            {landingDark ? "Modo claro" : "Modo escuro"}
          </button>
          <Link to="/login" className="rounded-3xl bg-white px-6 py-1 font-semibold text-black transition hover:bg-blue-100">
            Entrar
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="text-white md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col space-y-4 bg-white px-6 py-4 shadow-md md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              onToggleLandingTheme?.();
              setMenuOpen(false);
            }}
            className="rounded-xl border border-blue-200 px-4 py-2 text-left font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            {landingDark ? "Modo claro" : "Modo escuro"}
          </button>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-center text-white transition hover:bg-blue-700"
          >
            Entrar
          </Link>
        </div>
      )}
    </nav>
  );
}
