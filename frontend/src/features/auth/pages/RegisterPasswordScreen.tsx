import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { registerUser } from "../services/authService";
import {
  doPasswordsMatch,
  getPasswordRules,
  isStrongPassword,
  type PasswordRule,
} from "../utils/passwordRules";

type ActiveField = "password" | "confirm" | null;

export default function RegisterPasswordScreen() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Criar conta - Bedrock";
  }, []);

  const rules = useMemo(() => getPasswordRules(senha), [senha]);
  const validCount = rules.filter((rule) => rule.valid).length;
  const progress = (validCount / rules.length) * 100;
  const isPasswordValid = validCount === rules.length;
  const passwordsMatch = doPasswordsMatch(senha, confirmarSenha);
  const showConfirmError = confirmarSenha.length > 0 && !passwordsMatch;
  const canSubmit = isStrongPassword(senha) && passwordsMatch;

  const showPasswordBubble = activeField === "password";
  const showConfirmBubble = activeField === "confirm";

  const focusConfirmField = () => {
    const target = document.getElementById("register-password-confirm");
    target?.focus();
  };

  const focusSubmitButton = () => {
    const target = document.getElementById("register-password-submit");
    target?.focus();
  };

  const handlePasswordTab = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    focusConfirmField();
  };

  const handleConfirmTab = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    focusSubmitButton();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nome = localStorage.getItem("user_nome") || "";
      const email = localStorage.getItem("user_email") || "";

      if (!nome || !email) throw new Error("Dados incompletos.");
      if (!isStrongPassword(senha)) {
        throw new Error("A senha ainda não atende aos requisitos mínimos.");
      }
      if (!doPasswordsMatch(senha, confirmarSenha)) {
        throw new Error("As senhas informadas não coincidem.");
      }

      const data = await registerUser(nome, email, senha);
      localStorage.removeItem("user_nome");
      localStorage.removeItem("user_email");
      alert(data.message);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao concluir cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Defina sua senha"
      description="Crie uma senha e confirme para concluir o cadastro."
      step="Etapa 3 de 3"
      contentWidthClass="max-w-md"
      cardOverflowClass="overflow-visible"
    >
      <form onSubmit={handleSubmit} className="overflow-visible">
        <div className="space-y-5">
          <div className="relative min-w-0">
            <PasswordInput
              id="register-password"
              label="Senha"
              value={senha}
              onChange={(value) => {
                setSenha(value);
                if (error) setError(null);
              }}
              show={showPassword}
              onToggleShow={() => setShowPassword((value) => !value)}
              placeholder="Crie uma senha"
              isValid={isPasswordValid}
              hasError={false}
              onFocus={() => setActiveField("password")}
              onBlur={(event) => {
                const next = event.relatedTarget as HTMLElement | null;
                if (!next?.closest("[data-password-overlay='password']")) {
                  window.requestAnimationFrame(() => {
                    if (document.activeElement?.id !== "register-password") {
                      setActiveField((current) => (current === "password" ? null : current));
                    }
                  });
                }
              }}
              onKeyDown={handlePasswordTab}
            />

            <AnimatePresence mode="wait">
              {showPasswordBubble && (
                <PasswordRulesBubble
                  key="password-bubble"
                  rules={rules}
                  progress={progress}
                  validCount={validCount}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="relative min-w-0">
            <PasswordInput
              id="register-password-confirm"
              label="Confirmar senha"
              value={confirmarSenha}
              onChange={(value) => {
                setConfirmarSenha(value);
                if (error) setError(null);
              }}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((value) => !value)}
              placeholder="Repita sua senha"
              isValid={passwordsMatch}
              hasError={showConfirmError}
              onFocus={() => setActiveField("confirm")}
              onBlur={(event) => {
                const next = event.relatedTarget as HTMLElement | null;
                if (!next?.closest("[data-password-overlay='confirm']")) {
                  window.requestAnimationFrame(() => {
                    if (document.activeElement?.id !== "register-password-confirm") {
                      setActiveField((current) => (current === "confirm" ? null : current));
                    }
                  });
                }
              }}
              onKeyDown={handleConfirmTab}
            />

            <AnimatePresence mode="wait">
              {showConfirmBubble && (
                <ConfirmPasswordBubble
                  key="confirm-bubble"
                  isPasswordEmpty={senha.length === 0}
                  isMatch={passwordsMatch}
                  hasError={showConfirmError}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="app-feedback app-feedback-error"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              id="register-password-submit"
              type="submit"
              disabled={!canSubmit || loading}
              whileTap={{ scale: 0.985 }}
              onFocus={() => setActiveField(null)}
              className={`btn btn-block min-h-[52px] rounded-2xl text-base font-semibold transition ${
                canSubmit && !loading
                  ? "auth-button-primary"
                  : "cursor-not-allowed border border-[var(--app-border)] bg-[var(--app-bg-muted)] text-[var(--app-text-muted)]"
              }`}
            >
              {loading ? "Concluindo..." : "Concluir cadastro"}
            </motion.button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

function PasswordRulesBubble({
  rules,
  progress,
  validCount,
}: {
  rules: PasswordRule[];
  progress: number;
  validCount: number;
}) {
  const completed = validCount === rules.length;

  return (
    <motion.div
      data-password-overlay="password"
      initial={{ opacity: 0, x: 18, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.985 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mt-3 rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-4 shadow-[0_18px_42px_-24px_rgba(15,23,42,0.45)] lg:absolute lg:left-[calc(100%+16px)] lg:top-7 lg:mt-0 lg:w-72"
    >
      <div className="absolute -left-2 top-8 hidden h-4 w-4 rotate-45 border-b border-l border-[var(--app-border)] bg-[var(--app-bg-elevated)] lg:block" />

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--app-text)]">
            {completed ? "Senha forte" : "Força da senha"}
          </p>
          <p className="text-xs text-[var(--app-text-muted)]">
            {completed
              ? "Tudo certo. Agora repita a senha."
              : `${validCount} de ${rules.length} requisitos`}
          </p>
        </div>
        <motion.div
          animate={{ scale: completed ? [1, 1.12, 1] : 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            completed
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
          }`}
        >
          <ShieldIcon className="h-5 w-5" />
        </motion.div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--app-border)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className={`h-full rounded-full ${
            progress >= 100 ? "bg-emerald-500" : progress >= 60 ? "bg-amber-500" : "bg-rose-500"
          }`}
        />
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <motion.div
            key={rule.label}
            layout
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`flex items-center gap-2 rounded-2xl px-2 py-1.5 text-sm transition ${
              rule.valid
                ? "bg-emerald-500/8 text-[var(--app-text)]"
                : "text-[var(--app-text-muted)]"
            }`}
          >
            <motion.span
              animate={{ scale: rule.valid ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                rule.valid
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-[var(--app-border)] bg-[var(--app-bg-elevated)]"
              }`}
            >
              {rule.valid ? <CheckIcon className="h-3.5 w-3.5" /> : <DotIcon className="h-3 w-3" />}
            </motion.span>
            {rule.label}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ConfirmPasswordBubble({
  isPasswordEmpty,
  isMatch,
  hasError,
}: {
  isPasswordEmpty: boolean;
  isMatch: boolean;
  hasError: boolean;
}) {
  const text = isPasswordEmpty
    ? "Digite a senha primeiro."
    : isMatch
      ? "Perfeito, as senhas coincidem."
      : "As senhas ainda estão diferentes.";

  return (
    <motion.div
      data-password-overlay="confirm"
      initial={{ opacity: 0, x: 18, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.985 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-20 mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-[0_18px_42px_-24px_rgba(15,23,42,0.32)] lg:absolute lg:left-[calc(100%+16px)] lg:top-9 lg:mt-0 lg:w-72 lg:min-h-[52px] ${
        isMatch
          ? "border-emerald-500/40 bg-[var(--app-bg-elevated)] text-emerald-700 dark:text-emerald-300"
          : hasError
            ? "border-rose-500/40 bg-[var(--app-bg-elevated)] text-rose-700 dark:text-rose-300"
            : "border-[var(--app-border)] bg-[var(--app-bg-elevated)] text-[var(--app-text-muted)]"
      }`}
    >
      <div className="absolute -left-2 top-4 hidden h-4 w-4 rotate-45 border-b border-l border-[var(--app-border)] bg-[var(--app-bg-elevated)] lg:block" />
      {isMatch ? <CheckIcon className="h-4 w-4 shrink-0" /> : <InfoIcon className="h-4 w-4 shrink-0" />}
      {text}
    </motion.div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  isValid,
  hasError,
  onFocus,
  onBlur,
  onKeyDown,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  isValid: boolean;
  hasError: boolean;
  onFocus: () => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--app-text)]">{label}</span>
      <motion.div
        animate={{
          boxShadow: isValid
            ? "0 0 0 3px rgba(52, 211, 153, 0.14)"
            : hasError
              ? "0 0 0 3px rgba(251, 113, 133, 0.14)"
              : "0 0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`flex items-center gap-2 rounded-2xl border px-4 transition ${
          isValid
            ? "border-emerald-500/70 bg-[var(--app-bg-elevated)]"
            : hasError
              ? "border-rose-500/70 bg-[var(--app-bg-elevated)]"
              : "border-[var(--app-border)] bg-[var(--app-bg-elevated)] focus-within:border-[var(--app-accent)]/80"
        }`}
      >
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="auth-password-native h-12 flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleShow}
          className="auth-password-toggle text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </motion.div>
    </label>
  );
}

function IconBase({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </IconBase>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="m2 2 20 20" />
      <path d="M6.7 6.7C3.7 8.6 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.4 4.6-1" />
      <path d="M19.3 17.3C21 15.6 22 12 22 12s-3.5-7-10-7c-1 0-2 .2-2.9.5" />
      <path d="M10.6 10.6A2 2 0 0 0 12 15a2 2 0 0 0 1.4-.6" />
    </IconBase>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </IconBase>
  );
}
