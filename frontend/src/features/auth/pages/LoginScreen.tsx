import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storeSessionUser } from "../../../shared/authSession";
import AuthShell from "../components/AuthShell";
import { loginUser } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Entrar - Bedrock";

    const token = localStorage.getItem("auth_token");
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(email, senha);
      localStorage.setItem("auth_token", data.token);
      storeSessionUser(data.usuario);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Acesso" title="Entrar">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--app-text)]">
            E-mail
          </span>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@instituicao.edu"
            className="input input-bordered app-input auth-input text-base"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--app-text)]">
            Senha
          </span>
          <input
            id="login-password"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            className="input input-bordered app-input auth-input text-base"
            required
          />
        </label>

        {error && (
          <div role="alert" className="app-feedback app-feedback-error text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary auth-button-primary btn-block min-h-[52px] rounded-2xl text-base font-semibold shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs" />
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <div className="text-center text-sm text-[var(--app-text-muted)]">
        Não tem conta?{" "}
        <Link
          to="/register-name"
          className="font-semibold text-[var(--app-accent)] underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}
