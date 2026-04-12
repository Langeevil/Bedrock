// src/features/auth/pages/RegisterEmailScreen.tsx
import React, { useEffect, useState } from "react";
import fundo from "../../../assets/degrade-fundo-azul.jpg";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Crie uma conta - Bedrock";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      alert("Por favor, digite um email válido.");
      return;
    }

    localStorage.setItem("user_email", email);
    navigate("/register-password");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-center bg-cover relative px-4"
      style={{ backgroundImage: `url(${fundo})` }}
      aria-labelledby="titulo-criar-conta"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/20" />

      <section className="relative z-10 w-full max-w-sm">
        <div className="card bg-white/95 shadow-2xl rounded-none overflow-hidden">
          <div className="card-body p-6 sm:p-8">
            <h1
              id="titulo-criar-conta"
              className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center"
            >
              Crie uma conta
            </h1>

            <p className="text-sm text-gray-600 text-center mt-1">
              Digite seu email para continuar.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="floating-label block w-full" htmlFor="register-email">
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="input input-bordered w-full"
                  required
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-sm bg-[#1877F2] text-white font-bold"
              >
                Avançar
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Já tem conta?{" "}
              <Link to="/login" className="link link-primary">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
