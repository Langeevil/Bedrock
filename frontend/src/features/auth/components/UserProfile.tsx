import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

export default function UserProfile({ collapsed }: { readonly collapsed: boolean }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar dados do usuário do localStorage
    const nome = localStorage.getItem("user_nome");
    const email = localStorage.getItem("user_email");
    setUserName(nome);
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_nome");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mt-auto border-t border-white/20 pt-4">
      <div className={`relative ${collapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center w-full rounded-md px-3 py-2 text-white/95 hover:bg-white/10 transition-all ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
            <User size={18} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold truncate text-white">
                {userName || "Usuário"}
              </div>
              <div className="text-xs truncate text-white/70">
                {userEmail || "email@exemplo.com"}
              </div>
            </div>
          )}
        </button>

        {showMenu && !collapsed && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-[#0d2145] rounded-md shadow-xl border border-white/10 z-50">
            <button
              onClick={() => {
                navigate("/settings");
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-white/10 text-sm transition-all rounded-t-md"
            >
              <User size={16} />
              Perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm transition-all rounded-b-md border-t border-white/10"
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
