type FeatureInDevelopmentProgressProps = {
  title: string;
  category?: string;
  compact?: boolean;
  notes?: string[];
  statusLabel?: string;
  progressLabel?: string;
  progressValue?: number;
};

const DEFAULT_MESSAGE =
  "Funcionalidade em Desenvolvimento. Este recurso faz parte do roadmap do Bedrock e será implementado em uma etapa futura.";

export default function FeatureInDevelopmentProgress({
  title,
  category = "Em construção",
  compact = false,
  notes = [],
  statusLabel = "Desenvolvimento ativo",
  progressLabel = "Em progresso",
  progressValue = 65,
}: Readonly<FeatureInDevelopmentProgressProps>) {
  const clampedProgress = Math.max(5, Math.min(progressValue, 95));

  return (
    <section
      className={`rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <div className={`mx-auto ${compact ? "max-w-2xl" : "max-w-3xl"}`}>
        <div className="app-placeholder-badge mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--app-accent)]" />
          {category}
        </div>

        <div className="mt-5 flex justify-center">
          <div className="relative h-14 w-14">
            <div className="app-placeholder-ring absolute inset-0 animate-spin rounded-full border-2" />
            <div className="app-placeholder-inner absolute inset-[8px] flex items-center justify-center rounded-full border">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <h1
            className={`font-semibold text-[var(--app-text)] ${
              compact ? "text-xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {title}
          </h1>
          <p
            className={`mx-auto mt-3 max-w-2xl leading-7 text-[var(--app-text-muted)] ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {DEFAULT_MESSAGE}
          </p>
        </div>

        <div className="app-placeholder-panel mt-6 rounded-2xl border p-4 sm:p-5">
          <div className="app-placeholder-progress-track h-2 overflow-hidden rounded-full">
            <div
              className="app-placeholder-progress-bar h-full rounded-full transition-all duration-700"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--app-text-muted)] sm:text-sm">
            <span>{statusLabel}</span>
            <span>{progressLabel}</span>
          </div>
        </div>

        {notes.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm text-[var(--app-text-muted)]">
            {notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--app-accent)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
