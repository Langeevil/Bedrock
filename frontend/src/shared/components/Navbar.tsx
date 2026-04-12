import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-[#18396F]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-white">Logo</div>

        <div className="hidden items-center space-x-8 md:flex">
          <a href="#" className="font-semibold text-white hover:text-blue-200">
            Produtos
          </a>
          <a href="#" className="font-semibold text-white hover:text-blue-200">
            Planos
          </a>
          <a href="#" className="font-semibold text-white hover:text-blue-200">
            Solucoes
          </a>
          <a href="#" className="font-semibold text-white hover:text-blue-200">
            Sobre Nos
          </a>
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
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Produtos
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Planos
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Solucoes
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Sobre Nos
          </a>
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
