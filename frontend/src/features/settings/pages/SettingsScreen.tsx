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

      <div className="app-page flex-grow overflow-y-auto p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">Configurações</h1>

        <form onSubmit={saveLocalProfile} className="card app-panel mb-6 max-w-2xl p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-[var(--app-text)]">Dados da conta</h2>
          <label className="form-control mb-3">
            <span className="label-text text-[var(--app-text)]">Nome</span>
            <input
              className="input input-bordered app-input"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </label>
          <label className="form-control mb-3">
            <span className="label-text text-[var(--app-text)]">E-mail</span>
            <input
              className="input input-bordered app-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            className="btn w-fit border-0 bg-blue-600 text-white hover:bg-blue-500"
            type="submit"
          >
            Salvar dados locais
          </button>
        </form>

        <div className="card app-panel max-w-2xl p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-[var(--app-text)]">Tipo de perfil</h2>
          <select
            className="select select-bordered app-input mb-4"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="professor">Professor</option>
            <option value="aluno">Aluno</option>
            <option value="empresa">Empresa</option>
          </select>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn border-0 bg-cyan-600 text-white hover:bg-cyan-500 disabled:border-0 disabled:bg-slate-600 disabled:text-slate-200"
              onClick={saveRole}
              disabled={loading}
              type="button"
            >
              {loading ? "Salvando..." : "Atualizar perfil"}
            </button>
            <button
              className="btn btn-outline border-red-400 text-red-300 hover:border-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={logout}
              type="button"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
