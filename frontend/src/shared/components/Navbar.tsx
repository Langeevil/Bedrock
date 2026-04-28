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
  { href: "#scale", label: "Soluções" },
  { href: "#about", label: "Sobre Nós" },
];

export default function Navbar({
  landingDark = false,
  onToggleLandingTheme,
}: Readonly<NavbarProps>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-[#18396F]">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-xl font-bold text-white sm:text-2xl">Logo</div>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="font-semibold text-white hover:text-blue-200">
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onToggleLandingTheme}
            className="min-h-[44px] rounded-3xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:text-base"
          >
            {landingDark ? "Modo claro" : "Modo escuro"}
          </button>
          <Link
            to="/login"
            className="inline-flex min-h-[44px] items-center rounded-3xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-blue-100 lg:text-base"
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-white px-4 py-4 shadow-md md:hidden">
          <div className="mx-auto flex max-w-screen-xl flex-col space-y-4 sm:px-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
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
              className="min-h-[44px] rounded-xl border border-blue-200 px-4 py-3 text-left text-base font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {landingDark ? "Modo claro" : "Modo escuro"}
            </button>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-base text-white transition hover:bg-blue-700"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
