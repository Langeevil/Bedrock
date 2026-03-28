import { useState } from "react";
import { completeProfile } from "../../features/auth/services/authService";
import { storeSessionUser } from "../authSession";

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
      alert(`Perfil atualizado para: ${role}`);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white p-8 shadow-2xl">
        <h2 className="mb-4 text-center text-2xl font-semibold text-slate-900">
          Complete seu perfil
        </h2>

        <div className="space-y-3">
          {options.map((item) => (
            <button
              key={item.value}
              onClick={() => setRole(item.value)}
              className={`btn w-full ${
                role === item.value
                  ? "btn-primary text-white"
                  : "btn-outline border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary mt-6 w-full"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
