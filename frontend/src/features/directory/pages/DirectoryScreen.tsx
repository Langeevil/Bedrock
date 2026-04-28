import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import {
  getCurrentTenancySummary,
  listDirectoryEntries,
  type DirectoryEntry,
  type DirectoryScopeOption,
  type TenancySummary,
} from "../services/directoryService";

const ROLE_OPTIONS = [
  { value: "", label: "Todos os papéis" },
  { value: "organization_owner", label: "Dono da instituição" },
  { value: "organization_admin", label: "Admin da instituição" },
  { value: "coordinator", label: "Coordenador" },
  { value: "professor", label: "Professor" },
  { value: "student", label: "Aluno" },
  { value: "external_partner", label: "Parceiro externo" },
];

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
}

function badgeTone(scope: DirectoryEntry["scope"]) {
  return scope === "current_organization"
    ? "bg-emerald-500/15 text-emerald-600"
    : "bg-blue-500/15 text-blue-600";
}

export default function DirectoryScreen() {
  const [tenancy, setTenancy] = useState<TenancySummary | null>(null);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [scope, setScope] = useState<DirectoryScopeOption>("organization");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Diretório - Bedrock";
  }, []);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [tenancyData, directoryData] = await Promise.all([
          getCurrentTenancySummary(),
          listDirectoryEntries({ scope: "organization" }),
        ]);
        setTenancy(tenancyData);
        setScope(tenancyData.allowed_directory_scopes.includes("organization") ? "organization" : tenancyData.allowed_directory_scopes[0]);
        setEntries(directoryData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar diretório.");
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  useEffect(() => {
    if (!tenancy) return;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await listDirectoryEntries({ q: search, role, scope });
        setEntries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar diretório.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, role, scope, tenancy]);

  const counters = useMemo(() => {
    return {
      current: entries.filter((entry) => entry.scope === "current_organization").length,
      external: entries.filter((entry) => entry.scope === "external_organization").length,
      online: entries.filter((entry) => entry.presence_status === "online").length,
    };
  }, [entries]);

  return (
    <div className="app-page flex h-dvh overflow-hidden">
      <SidebarSimple />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Bedrock Directory</div>
              <h1 className="mt-3 text-3xl font-semibold">Diretório institucional</h1>
              <p className="mt-3 text-sm text-slate-300">
                Consulte pessoas da instituição ativa e, quando permitido, visualize contatos de outras organizações.
              </p>
            </div>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {tenancy && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Instituição ativa</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{tenancy.name}</p>
                <p className="mt-1 text-sm text-slate-500">slug: {tenancy.slug}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Membros ativos</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{tenancy.active_members}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Domínios vinculados</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{tenancy.domains.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Visibilidade do diretório</p>
                <p className="mt-3 text-xl font-semibold capitalize text-slate-900">{tenancy.directory_visibility}</p>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Pessoas</h2>
                <p className="text-sm text-slate-500">
                  Busca por nome, e-mail e domínios da organização.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(16rem,1fr)_12rem_12rem]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    aria-label="Buscar no diretório por nome, email ou domínio"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome, e-mail ou domínio"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none focus:border-blue-400"
                  />
                </label>

                <select
                  aria-label="Filtrar diretório por papel"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Escopo do diretório"
                  value={scope}
                  onChange={(event) => setScope(event.target.value as DirectoryScopeOption)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
                >
                  {tenancy?.allowed_directory_scopes.map((option) => (
                    <option key={option} value={option}>
                      {option === "organization"
                        ? "Instituição atual"
                        : option === "external"
                        ? "Outras instituições"
                        : "Todos os escopos"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                atuais: {counters.current}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                externas: {counters.external}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                online: {counters.online}
              </span>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">Carregando diretório...</div>
            ) : entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Nenhum usuário encontrado para os filtros atuais.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {entries.map((entry) => (
                  <article key={`${entry.organization.id}-${entry.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-slate-900">{entry.nome}</div>
                        <div className="truncate text-sm text-slate-500">{entry.email}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeTone(entry.scope)}`}>
                            {entry.scope === "current_organization" ? "Instituição atual" : "Outra instituição"}
                          </span>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                            {roleLabel(entry.organization_role)}
                          </span>
                          {entry.system_role && (
                            <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                              {entry.system_role}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div
                          className={`text-xs font-medium ${
                            entry.presence_status === "online" ? "text-emerald-600" : "text-slate-500"
                          }`}
                        >
                          {entry.presence_status === "online" ? "Online" : "Offline"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{entry.organization.name}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
