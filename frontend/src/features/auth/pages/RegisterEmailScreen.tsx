import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Criar conta - Bedrock";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email.trim())) {
      setError("Informe um e-mail válido para continuar.");
      return;
    }

    localStorage.setItem("user_email", email.trim().toLowerCase());
    navigate("/register-password");
  };

  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Seu e-mail"
      description="Informe o e-mail que será usado no acesso."
      step="Etapa 2 de 3"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block" htmlFor="register-email">
          <span className="mb-1.5 block text-sm font-medium text-[var(--app-text)]">
            E-mail
          </span>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="voce@instituicao.edu"
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
