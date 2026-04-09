import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { subscribeAuthSession } from "../../../shared/authSession";

export default function UserProfile({ collapsed }: { readonly collapsed: boolean }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUserData = () => {
      const nome = localStorage.getItem("user_nome");
      const email = localStorage.getItem("user_email");
      setUserName(nome);
      setUserEmail(email);
    };

    updateUserData();

    // Subscribe to auth session changes
    const unsubscribe = subscribeAuthSession(updateUserData);
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_nome");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mt-auto border-t border-[var(--app-sidebar-surface-border)] pt-4">
      <div className={`relative ${collapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex w-full items-center rounded-md px-3 py-2 text-[color:var(--app-sidebar-contrast)]/95 transition-all hover:bg-[var(--app-sidebar-surface)] ${
            collapsed ? "justify-center" : "gap-3"
          }`}
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
          <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-md border border-[var(--app-sidebar-surface-border)] bg-[var(--app-sidebar-popup)] shadow-xl">
            <button
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
