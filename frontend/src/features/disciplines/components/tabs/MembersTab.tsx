import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Shield, User } from "lucide-react";
import type { DisciplineMember } from "../../types/disciplineTypes";
import { addMember, listMembers } from "../../services/membersService";
import {
  listCurrentOrganizationMembers,
  type OrganizationMember,
} from "../../../organizations/services/organizationService";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role: string) {
  switch (role) {
    case "organization_owner":
      return "Dono da organizacao";
    case "organization_admin":
      return "Administrador";
    case "coordinator":
      return "Coordenador";
    case "professor":
      return "Professor";
    case "student":
      return "Aluno";
    case "external_partner":
      return "Parceiro externo";
    default:
      return role;
  }
}

function MemberRow({ member }: Readonly<{ member: DisciplineMember }>) {
  const isLeader = ["professor", "coordinator"].includes(member.discipline_role);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          isLeader
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-gradient-to-br from-blue-500 to-cyan-600"
        }`}
      >
        {initials(member.nome)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{member.nome}</p>
        <p className="truncate text-xs text-slate-400">{member.email}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-slate-600">{roleLabel(member.discipline_role)}</p>
        <p className="text-[11px] text-slate-400">{roleLabel(member.organization_role || "")}</p>
      </div>
      <div className={`rounded-lg p-1.5 ${isLeader ? "bg-amber-50" : "bg-blue-50"}`}>
        {member.system_role === "system_admin" ? (
          <Shield className="h-4 w-4 text-rose-600" />
        ) : isLeader ? (
          <GraduationCap className="h-4 w-4 text-amber-600" />
        ) : (
          <User className="h-4 w-4 text-blue-600" />
        )}
      </div>
    </div>
  );
}

export function MembersTab({ disciplineId }: Readonly<{ disciplineId: number }>) {
  const [members, setMembers] = useState<DisciplineMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([listMembers(disciplineId), listCurrentOrganizationMembers()])
      .then(([items, organizationMembers]) => {
        setMembers(items);
        setOrgMembers(organizationMembers);
        setError(null);
      })
      .catch((err: Error) => {
        setMembers([]);
        setOrgMembers([]);
        setError(err.message || "Erro ao carregar membros.");
      })
      .finally(() => setLoading(false));
  }, [disciplineId]);

  const grouped = useMemo(
    () => ({
      leaders: members.filter((m) => ["professor", "coordinator"].includes(m.discipline_role)),
      students: members.filter((m) => m.discipline_role === "student"),
      others: members.filter(
        (m) => !["professor", "coordinator", "student"].includes(m.discipline_role)
      ),
    }),
    [members]
  );

  const availableOrgMembers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.id));
    return orgMembers.filter((member) => !memberIds.has(member.id));
  }, [members, orgMembers]);

  async function handleAddMember(event: React.FormEvent) {
    event.preventDefault();
    const userId = Number(selectedUserId);
    if (!Number.isInteger(userId) || userId <= 0) return;

    try {
      setSaving(true);
      const updated = await addMember(disciplineId, {
        userId,
        role: selectedRole,
      });
      setMembers(updated);
      setSelectedUserId("");
      setSelectedRole("student");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar membro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-sm text-slate-500">Carregando membros...</div>;
  }

  if (error) {
    return (
      <div role="alert" className="app-feedback app-feedback-error">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAddMember}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-slate-900">Adicionar membro a disciplina</h3>
        <p className="mt-1 text-xs text-slate-500">
          Selecione um usuario ja vinculado a instituicao atual.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr_auto]">
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">Selecione um usuario</option>
            {availableOrgMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nome} ({member.email})
              </option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="student">Aluno</option>
            <option value="professor">Professor</option>
            <option value="coordinator">Coordenador</option>
          </select>
          <button
            type="submit"
            disabled={!selectedUserId || saving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>

      {grouped.leaders.length > 0 && (
        <section>
          <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lideranca academica
          </h3>
          <div className="flex flex-col gap-2">
            {grouped.leaders.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {grouped.students.length > 0 && (
        <section>
          <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Alunos ({grouped.students.length})
          </h3>
          <div className="flex flex-col gap-2">
            {grouped.students.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {grouped.others.length > 0 && (
        <section>
          <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Outros perfis
          </h3>
          <div className="flex flex-col gap-2">
            {grouped.others.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
