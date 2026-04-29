import { useEffect, useMemo, useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { getStoredSystemRole } from "../../../shared/authSession";
import {
  addCurrentOrganizationMember,
  listCurrentOrganizationMembers,
  updateCurrentOrganizationMemberRole,
  type OrganizationMember,
} from "../../organizations/services/organizationService";
import {
  createAdminOrganization,
  getAdminSummary,
  listAdminOrganizations,
  listAdminUsers,
  updateAdminUser,
} from "../services/adminService";
import type { AdminOrganization, AdminSummary, AdminUser } from "../types/adminTypes";

type AdminSection = "overview" | "users" | "organizations" | "governance";

const ROLE_OPTIONS = [
  "organization_owner",
  "organization_admin",
  "coordinator",
  "professor",
  "student",
  "external_partner",
];

const STATUS_OPTIONS = ["active", "inactive", "suspended"];

const ADMIN_SECTIONS: Array<{ id: AdminSection; label: string; description: string }> = [
  {
    id: "overview",
    label: "Visao geral",
    description: "Resumo do escopo administrativo e indicadores principais.",
  },
  {
    id: "users",
    label: "Usuarios",
    description: "Papeis, status de conta e privilegios administrativos.",
  },
  {
    id: "organizations",
    label: "Instituicoes",
    description: "Cadastro institucional e visibilidade das organizacoes.",
  },
  {
    id: "governance",
    label: "Governanca",
    description: "Membros da instituicao atual e matriz de permissoes.",
  },
];

const PERMISSION_GROUPS = [
  {
    title: "Instituicao",
    items: [
      {
        label: "Ver organizacao",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor", "student", "external_partner"],
      },
      {
        label: "Gerenciar membros",
        allowed: ["organization_owner", "organization_admin"],
      },
      {
        label: "Assumir papel privilegiado",
        allowed: ["organization_owner"],
      },
    ],
  },
  {
    title: "Academico e projetos",
    items: [
      {
        label: "Criar disciplinas",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor"],
      },
      {
        label: "Gerenciar todas as disciplinas",
        allowed: ["organization_owner", "organization_admin", "coordinator"],
      },
      {
        label: "Criar projetos",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor", "student"],
      },
      {
        label: "Gerenciar todos os projetos",
        allowed: ["organization_owner", "organization_admin", "coordinator"],
      },
    ],
  },
  {
    title: "Chat e colaboracao",
    items: [
      {
        label: "Acessar chat",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor", "student", "external_partner"],
      },
      {
        label: "Criar conversa direta",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor", "student", "external_partner"],
      },
      {
        label: "Criar grupo",
        allowed: ["organization_owner", "organization_admin", "coordinator", "professor", "student"],
      },
      {
        label: "Criar canal",
        allowed: ["organization_owner", "organization_admin", "coordinator"],
      },
      {
        label: "Administrar chat institucional",
        allowed: ["organization_owner", "organization_admin"],
      },
    ],
  },
];

function roleLabel(role?: string | null) {
  switch (role) {
    case "system_admin":
      return "System Admin";
    case "organization_owner":
      return "Dono da instituicao";
    case "organization_admin":
      return "Admin da instituicao";
    case "coordinator":
      return "Coordenador";
    case "professor":
      return "Professor";
    case "student":
      return "Aluno";
    case "external_partner":
      return "Parceiro externo";
    default:
      return role || "-";
  }
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Ativo";
    case "inactive":
      return "Inativo";
    case "suspended":
      return "Suspenso";
    default:
      return status || "-";
  }
}

function badgeTone(role?: string | null) {
  switch (role) {
    case "organization_owner":
    case "system_admin":
      return "bg-slate-900 text-white";
    case "organization_admin":
      return "bg-blue-600 text-white";
    case "coordinator":
      return "bg-amber-500 text-slate-950";
    case "professor":
      return "bg-emerald-500 text-white";
    case "student":
      return "bg-slate-200 text-slate-700";
    case "external_partner":
      return "bg-fuchsia-100 text-fuchsia-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function SectionButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{description}</div>
    </button>
  );
}

export default function AdminScreen() {
  const isSystemAdmin = getStoredSystemRole() === "system_admin";
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [orgForm, setOrgForm] = useState({ name: "", slug: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "student" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [nextSummary, nextUsers, nextOrganizations] = await Promise.all([
          getAdminSummary(),
          listAdminUsers(),
          listAdminOrganizations(),
        ]);
        const nextOrgMembers = await listCurrentOrganizationMembers().catch(() => []);
        setSummary(nextSummary);
        setUsers(nextUsers);
        setOrganizations(nextOrganizations);
        setOrgMembers(nextOrgMembers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar area administrativa.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
  }, [users, search]);

  async function changeUser(userId: number, payload: Record<string, unknown>) {
    try {
      setSavingUserId(userId);
      const response = await updateAdminUser(userId, payload);
      setUsers((current) =>
        current.map((item) => (item.id === userId ? { ...item, ...response.usuario } : item))
      );
      setOrgMembers((current) =>
        current.map((item) =>
          item.id === userId
            ? {
                ...item,
                system_role: response.usuario.system_role,
                effective_role: response.usuario.role,
                organization_role: response.usuario.membership?.role || response.usuario.role,
                account_status: response.usuario.account_status,
                membership_status: response.usuario.membership?.status || item.membership_status,
              }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuario.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function changeOrganizationMemberRole(userId: number, role: string) {
    try {
      setSavingUserId(userId);
      const response = await updateCurrentOrganizationMemberRole(userId, role);
      setOrgMembers((current) =>
        current.map((item) =>
          item.id === userId
            ? {
                ...item,
                system_role: response.usuario.system_role,
                effective_role: response.usuario.role,
                organization_role: response.usuario.membership?.role || response.usuario.role,
                membership_status: response.usuario.membership?.status || item.membership_status,
              }
            : item
        )
      );
      setUsers((current) =>
        current.map((item) => (item.id === userId ? { ...item, ...response.usuario } : item))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar papel do membro.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function submitOrganization(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await createAdminOrganization(orgForm);
      setOrganizations((current) => [...current, created]);
      setOrgForm({ name: "", slug: "" });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar instituicao.");
    }
  }

  async function submitMember(event: React.FormEvent) {
    event.preventDefault();
    try {
      const response = await addCurrentOrganizationMember(memberForm);
      setUsers((current) => {
        const exists = current.some((item) => item.id === response.usuario.id);
        return exists
          ? current.map((item) =>
              item.id === response.usuario.id ? { ...item, ...response.usuario } : item
            )
          : [...current, response.usuario as unknown as AdminUser];
      });
      setOrgMembers((current) => {
        const exists = current.some((item) => item.id === response.usuario.id);
        return exists
          ? current.map((item) =>
              item.id === response.usuario.id
                ? {
                    ...item,
                    ...response.usuario,
                    effective_role: response.usuario.role,
                    organization_role: response.usuario.membership?.role || response.usuario.role,
                    account_status: response.usuario.account_status || "active",
                    membership_status: response.usuario.membership?.status || "active",
                  }
                : item
            )
          : [
              ...current,
              {
                ...response.usuario,
                effective_role: response.usuario.role,
                organization_role: response.usuario.membership?.role || response.usuario.role,
                account_status: response.usuario.account_status || "active",
                membership_status: response.usuario.membership?.status || "active",
                joined_at: new Date().toISOString(),
              },
            ];
      });
      setMemberForm({ email: "", role: "student" });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar membro na instituicao.");
    }
  }

  function renderOverview() {
    if (!summary) return null;

    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Escopo</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {summary.scope === "system" ? "Sistema" : "Instituicao"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Usuarios</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.total_users}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Usuarios ativos</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.active_users}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Instituicoes</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.total_organizations}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Foco atual da administracao</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Usuarios agora possuem papel global, papel institucional e organizacao primaria.</p>
              <p>Permissoes ficaram centralizadas para auth, disciplinas, projetos e chat.</p>
              <p>A area administrativa ja permite governanca institucional sem expor funcoes a usuarios comuns.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Proximas consolidacoes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Auditoria de acoes administrativas.</p>
              <p>Gestao visual de memberships por disciplina.</p>
              <p>Fluxo de troca de organizacao ativa e endurecimento do login.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderUsers() {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Usuarios</h2>
            <p className="text-sm text-slate-500">Gerencie status, papel institucional e privilegio global.</p>
          </div>
          <input
            aria-label="Buscar usuario por nome ou email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar usuario por nome ou email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 pr-4 font-medium">Usuario</th>
                <th className="pb-3 pr-4 font-medium">Instituicao</th>
                <th className="pb-3 pr-4 font-medium">Papel institucional</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                {isSystemAdmin && <th className="pb-3 pr-4 font-medium">Papel global</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-slate-800">{user.nome}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-slate-700">{user.organization?.name || "-"}</div>
                    {user.system_role && (
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeTone(user.system_role)}`}>
                        {roleLabel(user.system_role)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <select
                      value={user.membership?.role || user.role}
                      disabled={savingUserId === user.id}
                      onChange={(event) =>
                        changeUser(user.id, { organization_role: event.target.value })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-4">
                    <select
                      value={user.account_status}
                      disabled={savingUserId === user.id}
                      onChange={(event) =>
                        changeUser(user.id, { account_status: event.target.value })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  {isSystemAdmin && (
                    <td className="py-4 pr-4">
                      <select
                        value={user.system_role || ""}
                        disabled={savingUserId === user.id}
                        onChange={(event) =>
                          changeUser(user.id, { system_role: event.target.value || null })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <option value="">Sem papel global</option>
                        <option value="system_admin">System Admin</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderOrganizations() {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Instituicoes</h2>
          <p className="mb-5 text-sm text-slate-500">
            {isSystemAdmin
              ? "Catalogo institucional visivel para administracao global."
              : "Visao da instituicao atual para administracao local."}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {organizations.map((org) => (
              <div key={org.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-base font-semibold text-slate-800">{org.name}</div>
                <div className="mt-1 text-xs text-slate-500">slug: {org.slug}</div>
                {org.members_count !== undefined && (
                  <div className="mt-3 text-sm text-slate-600">membros vinculados: {org.members_count}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {isSystemAdmin && (
          <form onSubmit={submitOrganization} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Nova instituicao</h2>
            <p className="mb-5 text-sm text-slate-500">
              Cadastro manual de instituicoes pelo administrador global.
            </p>
            <div className="space-y-3">
              <input
                aria-label="Nome da instituicao"
                value={orgForm.name}
                onChange={(event) =>
                  setOrgForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Nome da instituicao"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                aria-label="Slug da instituicao"
                value={orgForm.slug}
                onChange={(event) =>
                  setOrgForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="slug-da-instituicao"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
              >
                Criar instituicao
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  function renderGovernance() {
    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submitMember} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Adicionar membro da instituicao</h2>
            <p className="mb-5 text-sm text-slate-500">
              Vincule um usuario ja cadastrado pela conta de e-mail.
            </p>
            <div className="space-y-3">
              <input
                aria-label="Email do membro da instituicao"
                value={memberForm.email}
                onChange={(event) =>
                  setMemberForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="email@exemplo.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <select
                value={memberForm.role}
                onChange={(event) =>
                  setMemberForm((current) => ({ ...current, role: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
              >
                Adicionar membro
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Matriz de permissoes</h2>
            <p className="mb-5 text-sm text-slate-500">
              Visao operacional das politicas centrais de acesso por papel institucional.
            </p>

            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-800">{group.title}</div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.label} className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <div className="flex flex-wrap gap-2">
                          {item.allowed.map((role) => (
                            <span
                              key={`${item.label}-${role}`}
                              className={`rounded-full px-2 py-1 text-xs font-medium ${badgeTone(role)}`}
                            >
                              {roleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Membros da instituicao atual</h2>
          <p className="mb-5 text-sm text-slate-500">
            Governanca local de papeis institucionais e visibilidade do escopo ativo.
          </p>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {orgMembers.map((member) => (
              <div key={member.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{member.nome}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeTone(member.organization_role)}`}>
                        {roleLabel(member.organization_role)}
                      </span>
                      {member.system_role && (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeTone(member.system_role)}`}>
                          {roleLabel(member.system_role)}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                        {statusLabel(member.account_status)}
                      </span>
                    </div>
                  </div>

                  <select
                    value={member.organization_role}
                    disabled={savingUserId === member.id}
                    onChange={(event) => changeOrganizationMemberRole(member.id, event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "users":
        return renderUsers();
      case "organizations":
        return renderOrganizations();
      case "governance":
        return renderGovernance();
      case "overview":
      default:
        return renderOverview();
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fc]">
      <SidebarSimple />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <header className="rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Bedrock Admin</div>
              <h1 className="mt-3 text-3xl font-semibold">Centro de administracao institucional</h1>
              <p className="mt-3 text-sm text-slate-300">
                Area restrita para governar usuarios, instituicoes e politicas de acesso sem expor funcoes administrativas aos demais perfis.
              </p>
            </div>
          </header>

          {error && (
            <div role="alert" className="app-feedback app-feedback-error">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-slate-500">Carregando painel administrativo...</div>}

          {!loading && (
            <>
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {ADMIN_SECTIONS.map((section) => (
                  <SectionButton
                    key={section.id}
                    active={activeSection === section.id}
                    label={section.label}
                    description={section.description}
                    onClick={() => setActiveSection(section.id)}
                  />
                ))}
              </section>

              {renderSection()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
