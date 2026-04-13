import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Palette, User } from "lucide-react";
import {
  getStoredThemePreference,
  setThemePreference,
  type ThemePreference,
} from "../theme";

export default function UserProfile({ collapsed }: { readonly collapsed: boolean }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    return getStoredThemePreference();
  });
  const navigate = useNavigate();

  useEffect(() => {
    const nome = localStorage.getItem("user_nome");
    const email = localStorage.getItem("user_email");
    setUserName(nome);
    setUserEmail(email);
  }, []);

  useEffect(() => {
    function handleThemeChange() {
      setThemePreferenceState(getStoredThemePreference());
    }

    window.addEventListener("bedrock-theme-change", handleThemeChange);
    return () => window.removeEventListener("bedrock-theme-change", handleThemeChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_nome");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/login", { replace: true });
  };

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
    if (themePreference === "system") return "Tema: Sistema";
    if (themePreference === "bedrocklight") return "Tema: Claro";
    return "Tema: Escuro";
  }

  function handleMenuToggle() {
    if (collapsed) {
      setShowMenu(false);
      return;
    }

    setShowMenu((current) => !current);
  }

  return (
    <div className="mt-auto border-t border-[var(--app-sidebar-surface-border)] pt-4">
      <div className={`relative ${collapsed ? "flex justify-center" : ""}`}>
        <button
          type="button"
          aria-label={collapsed ? "Abrir menu do usuario" : "Abrir menu do usuario e tema"}
          aria-haspopup="menu"
          aria-expanded={!collapsed && showMenu}
          onClick={handleMenuToggle}
          className={`flex w-full items-center rounded-md px-3 py-2 text-[color:var(--app-sidebar-contrast)]/95 transition-all ${
            collapsed ? "justify-center" : "gap-3"
          } ${collapsed ? "cursor-default" : "hover:bg-[var(--app-sidebar-surface)]"}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-sidebar-surface)]">
            <User size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-semibold text-[var(--app-sidebar-contrast)]">
                {userName || "Usuário"}
              </div>
              <div className="truncate text-xs text-[color:var(--app-sidebar-contrast)]/70">
                {userEmail || "email@exemplo.com"}
              </div>
            </div>
          )}
        </button>

        {showMenu && !collapsed && (
          <div role="menu" className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-md border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-popup)] shadow-xl">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate("/settings");
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-t-md px-3 py-2 text-sm text-[color:var(--app-sidebar-contrast)]/80 transition-all hover:bg-[var(--app-sidebar-surface)]"
            >
              <User size={16} />
              Perfil
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={cycleTheme}
              className="flex w-full items-center gap-3 border-t border-[var(--app-sidebar-surface-border)] px-3 py-2 text-sm text-[color:var(--app-sidebar-contrast)]/80 transition-all hover:bg-[var(--app-sidebar-surface)]"
            >
              <Palette size={16} />
              {themeLabel()}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-b-md border-t border-[var(--app-sidebar-surface-border)] px-3 py-2 text-sm text-red-300 transition-all hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
