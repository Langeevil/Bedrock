import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarSimple } from "../components/sidebar-simple";
import { completeProfile, getMe } from "../services/userService";

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

  function saveLocalProfile(e: FormEvent) {
    e.preventDefault();
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
    navigate("/login");
  }

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Settings</h1>

        <form onSubmit={saveLocalProfile} className="card bg-white shadow p-6 mb-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Dados da conta</h2>
          <label className="form-control mb-3">
            <span className="label-text text-slate-700">Nome</span>
            <input className="input input-bordered bg-white" value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label className="form-control mb-3">
            <span className="label-text text-slate-700">Email</span>
            <input className="input input-bordered bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn btn-primary w-fit" type="submit">Salvar dados locais</button>
        </form>

        <div className="card bg-white shadow p-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Tipo de perfil</h2>
          <select className="select select-bordered bg-white mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="professor">Professor</option>
            <option value="aluno">Aluno</option>
            <option value="empresa">Empresa</option>
          </select>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-secondary" onClick={saveRole} disabled={loading} type="button">
              {loading ? "Salvando..." : "Atualizar perfil"}
            </button>
            <button className="btn btn-outline btn-error" onClick={logout} type="button">Sair da conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

