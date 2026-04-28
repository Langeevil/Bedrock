import React, { useEffect, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import fundo from "../../../assets/degrade-fundo-azul.jpg";

export default function RegisterNameScreen() {
  const [nome, setNome] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Crie uma conta - Bedrock";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Por favor, digite seu nome completo.");
      return;
    }

    localStorage.setItem("user_nome", nome);
    navigate("/register-email");
  };

  const handleGoogle = () => {
    console.log("Login com Google (em breve)");
  };

  const handleFacebook = () => {
    console.log("Login com Facebook (em breve)");
  };

  return (
    <main
      className="relative flex min-h-dvh items-center justify-center bg-cover bg-center px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${fundo})` }}
      aria-labelledby="titulo-criar-conta"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/20" />

      <section className="relative z-10 w-full max-w-md">
        <div className="card overflow-hidden bg-white/95 shadow-2xl">
          <div className="card-body p-6 sm:p-8">
            <h1
              id="titulo-criar-conta"
              className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl"
            >
              Crie uma conta
            </h1>

            <p className="mt-1 text-center text-sm text-gray-600">
              Digite seu nome para começar rápido e fácil.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="floating-label block w-full" htmlFor="register-name">
                <input
                  id="register-name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input input-bordered min-h-[44px] w-full text-base"
                  required
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block min-h-[44px] border-0 bg-[#1877F2] text-base font-bold text-white"
                aria-label="Avançar"
              >
                Avançar
              </button>
            </form>

            <div className="divider my-4">ou</div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleGoogle}
                className="btn btn-circle btn-outline h-12 w-12 border border-gray-200 bg-white"
                aria-label="Continuar com Google"
              >
                <FcGoogle size={24} />
              </button>

              <button
                onClick={handleFacebook}
                className="btn btn-circle h-12 w-12 border-0 bg-[#1877F2] text-white"
                aria-label="Continuar com Facebook"
              >
                <FaFacebook size={20} className="text-white" />
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
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
