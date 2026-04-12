// src/features/auth/pages/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import fundo from "../../../assets/degrade-fundo-azul.jpg";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { storeSessionUser } from "../../../shared/authSession";

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-center bg-cover relative px-4"
      style={{ backgroundImage: `url(${fundo})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/20" />

      <section className="relative z-10 w-full max-w-sm">
        <div className="card bg-white/95 shadow-2xl overflow-hidden">
          <div className="card-body p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center">
              Entrar
            </h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="w-full block">
                <span className="label-text text-sm text-gray-700">E-mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="input input-bordered w-full mt-1"
                  required
                />
              </label>

              <label className="w-full block">
                <span className="label-text text-sm text-gray-700">Senha</span>
                <input
                  id="login-password"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  className="input input-bordered w-full mt-1"
                  required
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-sm bg-[#1877F2] text-white font-bold"
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

            <p className="text-center text-sm text-gray-600 mt-4">
              Não tem conta?{" "}
              <Link to="/register-name" className="link link-primary">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
