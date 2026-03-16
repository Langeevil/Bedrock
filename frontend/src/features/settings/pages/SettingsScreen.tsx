import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { completeProfile, getMe } from "../../auth/services/authService";

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [nome, setNome] = useState(localStorage.getItem("user_nome") || "");
  const [email, setEmail] = useState(localStorage.getItem("user_email") || "");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getMe();
        setNome(user.nome || "");
        setEmail(user.email || "");
        setRole(user.role || "");
      } catch {
        // noop
      }
    }

    loadUser();
  }, []);

  function saveLocalProfile(event: FormEvent) {
    event.preventDefault();
    localStorage.setItem("user_nome", nome);
    localStorage.setItem("user_email", email);
    alert("Dados locais atualizados.");
  }

  async function saveRole() {
    if (!role) return;

    try {
      setLoading(true);
      await completeProfile(role);
      alert("Perfil atualizado com sucesso.");
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_nome");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/login");
  }

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="app-page flex-grow overflow-y-auto px-6 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <h1 className="text-3xl font-semibold text-[var(--app-text)]">Configurações</h1>

          <form onSubmit={saveLocalProfile} className="card app-panel p-6 shadow sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[var(--app-text)]">Dados da conta</h2>
                <p className="text-sm text-[var(--app-text-muted)]">
                  Atualize as informações básicas exibidas no seu perfil.
                </p>
              </div>

              <div className="grid gap-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--app-text)]">Nome</span>
                  <input
                    className="input input-bordered app-input min-h-12"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--app-text)]">E-mail</span>
                  <input
                    className="input input-bordered app-input min-h-12"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </div>

              <div className="pt-1">
                <button
                  className="btn min-h-12 w-full border-0 bg-blue-600 px-5 text-white hover:bg-blue-500 sm:w-auto"
                  type="submit"
                >
                  Salvar dados locais
                </button>
              </div>
            </div>
          </form>

          <div className="card app-panel p-6 shadow sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[var(--app-text)]">Tipo de perfil</h2>
                <p className="text-sm text-[var(--app-text-muted)]">
                  Defina como você quer aparecer no sistema.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--app-text)]">Perfil</span>
                <select
                  className="select select-bordered app-input min-h-12"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                  <option value="empresa">Empresa</option>
                </select>
              </label>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <button
                  className="btn min-h-12 w-full border-0 bg-cyan-600 px-5 text-white hover:bg-cyan-500 disabled:border-0 disabled:bg-slate-600 disabled:text-slate-200 sm:w-auto"
                  onClick={saveRole}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Salvando..." : "Atualizar perfil"}
                </button>
                <button
                  className="btn btn-outline min-h-12 w-full border-red-400 px-5 text-red-300 hover:border-red-300 hover:bg-red-500/10 hover:text-red-200 sm:w-auto"
                  onClick={logout}
                  type="button"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
