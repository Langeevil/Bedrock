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
      className="relative flex min-h-dvh items-center justify-center bg-cover bg-center px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${fundo})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/20" />

      <section className="relative z-10 w-full max-w-md">
        <div className="card overflow-hidden bg-white/95 shadow-2xl">
          <div className="card-body p-6 sm:p-8">
            <h1 className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
              Entrar
            </h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block w-full">
                <span className="label-text text-sm text-gray-700">E-mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="input input-bordered mt-1 min-h-[44px] w-full text-base"
                  required
                />
              </label>

              <label className="block w-full">
                <span className="label-text text-sm text-gray-700">Senha</span>
                <input
                  id="login-password"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  className="input input-bordered mt-1 min-h-[44px] w-full text-base"
                  required
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block min-h-[44px] border-0 bg-[#1877F2] text-base font-bold text-white"
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

            <p className="mt-4 text-center text-sm text-gray-600">
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
