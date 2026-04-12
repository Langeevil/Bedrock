// components/ProfileModal.tsx
import { useState } from "react";
import { completeProfile } from "../services/authService";
import { storeSessionUser } from "../../../shared/authSession";

interface Props {
  readonly onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const options = [
    { value: "student", label: "Aluno" },
    { value: "professor", label: "Professor" },
    { value: "external_partner", label: "Parceiro Externo" },
  ];

  const handleSave = async () => {
    if (!role) {
      alert("Selecione um perfil");
      return;
    }

    try {
      setLoading(true);
      const user = await completeProfile(role);
      storeSessionUser(user);
      alert(`Perfil atualizado para: ${role}`); // mensagem temporária
      onClose();
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-profile-modal-title"
        className="w-full max-w-md rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-8 text-[var(--app-text)] shadow-2xl"
      >
        <h2 id="auth-profile-modal-title" className="mb-4 text-center text-2xl font-semibold text-[var(--app-text)]">
          Complete seu perfil
        </h2>

        <div className="space-y-3">
          {options.map((item) => (
            <button
              key={item.value}
              onClick={() => setRole(item.value)}
              aria-pressed={role === item.value}
              className={`btn w-full ${
                role === item.value
                  ? "btn-primary text-white"
                  : "btn-outline border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-bg-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary w-full mt-6"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
