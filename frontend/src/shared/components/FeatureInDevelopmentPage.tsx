type FeatureInDevelopmentPageProps = {
  title: string;
  category?: string;
  compact?: boolean;
  notes?: string[];
};

const DEFAULT_MESSAGE =
  "Funcionalidade em Desenvolvimento. Este recurso faz parte do roadmap do Bedrock e será implementado em uma etapa futura.";

export default function FeatureInDevelopmentPage({
  title,
  category = "Roadmap",
  compact = false,
  notes = [],
}: Readonly<FeatureInDevelopmentPageProps>) {
  return (
    <section
      className={`rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
          {category}
        </p>
        <h1
          className={`mt-3 font-semibold text-[var(--app-text)] ${
            compact ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {title}
        </h1>
        <p
          className={`mt-3 leading-7 text-[var(--app-text-muted)] ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {DEFAULT_MESSAGE}
        </p>

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
