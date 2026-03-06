// components/tabs/MembersTab.tsx

import { GraduationCap, User } from "lucide-react";
import type { Member } from "../../types/disciplineTypes";

// Mock — substitua por hook/service real
const MOCK_MEMBERS: Member[] = [
  { id: 1, name: "Dr. João Silva", role: "professor", joinedAt: new Date().toISOString() },
  { id: 2, name: "Ana Costa", role: "student", joinedAt: new Date().toISOString() },
  { id: 3, name: "Bruno Lima", role: "student", joinedAt: new Date().toISOString() },
  { id: 4, name: "Carla Mendes", role: "student", joinedAt: new Date().toISOString() },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

interface MemberRowProps {
  member: Member;
}

function MemberRow({ member }: Readonly<MemberRowProps>) {
  const isProfessor = member.role === "professor";
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold shrink-0 ${
          isProfessor
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-gradient-to-br from-blue-500 to-cyan-600"
        }`}
      >
        {initials(member.name)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
        <p className="text-xs text-slate-400">{isProfessor ? "Professor" : "Aluno"}</p>
      </div>
      <div className={`p-1.5 rounded-lg ${isProfessor ? "bg-amber-50" : "bg-blue-50"}`}>
        {isProfessor ? (
          <GraduationCap className="w-4 h-4 text-amber-600" />
        ) : (
          <User className="w-4 h-4 text-blue-600" />
        )}
      </div>
    </div>
  );
}

export function MembersTab() {
  const professors = MOCK_MEMBERS.filter((m) => m.role === "professor");
  const students = MOCK_MEMBERS.filter((m) => m.role === "student");

  return (
    <div className="flex flex-col gap-6">
      {professors.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Professor
          </h3>
          <div className="flex flex-col gap-2">
            {professors.map((m) => <MemberRow key={m.id} member={m} />)}
          </div>
        </section>
      )}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Alunos ({students.length})
        </h3>
        <div className="flex flex-col gap-2">
          {students.map((m) => <MemberRow key={m.id} member={m} />)}
        </div>
      </section>
    </div>
  );
}