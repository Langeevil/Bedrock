import type { Discipline } from "../../services/disciplinesService";

interface Props {
  discipline: Discipline;
}

export function SettingsTab({ discipline }: Readonly<Props>) {
  const fields = [
    { id: "name", label: "Nome", value: discipline.name },
    { id: "code", label: "Código", value: discipline.code },
    { id: "professor", label: "Professor", value: discipline.professor },
    {
      id: "created_at",
      label: "Criado em",
      value: discipline.created_at
        ? new Date(discipline.created_at).toLocaleDateString("pt-BR")
        : "—",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm">
        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-muted)] px-5 py-4 text-sm font-semibold text-[var(--app-text)]">
          Informações da Disciplina
        </div>

        <div className="divide-y divide-[var(--app-border)]">
          {fields.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[160px_1fr_auto] md:items-center"
            >
              <span className="text-sm font-semibold text-[var(--app-text-muted)]">
                {item.label}
              </span>
              <span className="text-sm text-[var(--app-text)]">{item.value}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm min-h-[44px] rounded-xl"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
        <div className="text-sm font-semibold text-red-700 dark:text-red-300">
          Zona de Perigo
        </div>
        <p className="mt-2 text-sm leading-6 text-red-600 dark:text-red-200">
          A exclusão da disciplina é permanente e não pode ser desfeita.
        </p>
        <button type="button" className="btn btn-error btn-sm mt-4 min-h-[44px] rounded-xl">
          Excluir Disciplina
        </button>
      </section>
    </div>
  );
}
