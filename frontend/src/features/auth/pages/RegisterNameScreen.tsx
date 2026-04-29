import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

export default function RegisterNameScreen() {
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Criar conta - Bedrock";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) {
      setError("Informe seu nome completo para continuar.");
      return;
    }

    localStorage.setItem("user_nome", nome.trim());
    navigate("/register-email");
  };

  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Criar conta"
      description="Informe seu nome completo para começar."
      step="Etapa 1 de 3"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block" htmlFor="register-name">
          <span className="mb-1.5 block text-sm font-medium text-[var(--app-text)]">
            Nome completo
          </span>
          <input
            id="register-name"
            type="text"
            placeholder="Digite seu nome completo"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (error) setError(null);
            }}
            className="input input-bordered app-input auth-input text-base"
            required
          />
        </label>

        {error && (
          <div role="alert" className="app-feedback app-feedback-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary auth-button-primary btn-block min-h-[48px] rounded-xl text-base font-semibold"
        >
          Avançar
        </button>
      </form>

      <div className="text-center text-sm text-[var(--app-text-muted)]">
        Já tem conta?{" "}
        <Link to="/login" className="font-medium text-[var(--app-accent)]">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}
