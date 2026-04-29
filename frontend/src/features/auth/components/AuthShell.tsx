import type { ReactNode } from "react";
import fundo from "../../../assets/degrade-fundo-azul.jpg";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  step?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentWidthClass?: string;
  cardOverflowClass?: string;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  step,
  children,
  footer,
  contentWidthClass = "max-w-md",
  cardOverflowClass = "overflow-hidden",
}: Readonly<AuthShellProps>) {
  return (
    <main
      className="relative flex min-h-dvh items-center justify-center overflow-x-clip bg-cover bg-center px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${fundo})` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,17,33,0.78),rgba(24,57,111,0.52),rgba(37,99,235,0.16))]" />

      <section className={`relative z-10 w-full ${contentWidthClass}`}>
        <div
          className={`auth-card ${cardOverflowClass} rounded-[2rem] border shadow-[0_24px_80px_rgba(8,17,33,0.34)]`}
        >
          <div className="auth-card-header relative rounded-t-[calc(2rem-1px)] border-b border-[var(--app-border)] px-6 py-6 sm:px-8">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--app-accent)]/8 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <img
                  src="/images/logo.png"
                  alt="Bedrock"
                  className="mb-4 h-10 w-auto object-contain sm:h-11"
                />
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-[var(--app-text)]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--app-text)]/80">
                    {description}
                  </p>
                )}
              </div>

              {step && (
                <span className="auth-step-chip shrink-0 rounded-full border px-3 py-1 text-xs font-medium text-[var(--app-text)]/80">
                  {step}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-b-[calc(2rem-1px)] bg-[var(--app-bg-elevated)] px-6 py-6 sm:px-8 sm:py-8">
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
