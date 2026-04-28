// src/features/auth/pages/RegisterPasswordScreen.tsx
import React, { useState } from "react";
import fundo from "../../../assets/degrade-fundo-azul.jpg";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterPasswordScreen() {
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nome = localStorage.getItem("user_nome") || "";
      const email = localStorage.getItem("user_email") || "";

      if (!nome || !email) throw new Error("Dados incompletos.");

      const data = await registerUser(nome, email, senha);

      alert(data.message);
      navigate("/login");
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
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center">
              Crie uma senha
            </h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="floating-label block w-full" htmlFor="register-password">
                <input
                  id="register-password"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="input input-bordered min-h-[44px] w-full text-base"
                  required
                />
              </label>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-block min-h-[44px] border-0 bg-[#1877F2] text-base font-bold text-white"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Concluir cadastro"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
