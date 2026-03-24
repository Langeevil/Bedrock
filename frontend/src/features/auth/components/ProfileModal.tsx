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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-100">
        <h2 className="text-2xl font-semibold text-slate-900 text-center mb-4">
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
          className="btn btn-primary w-full mt-6"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
