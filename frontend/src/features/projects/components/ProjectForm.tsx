import { useState } from "react";

interface Props {
  onAdd: (data: { title: string; description: string }) => Promise<void>;
}

export function ProjectForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title, description: desc });
    setTitle("");
    setDesc("");
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px",
    fontSize: 14, color: "#334155", background: "#f8fafc", width: "100%",
    outline: "none", transition: "border .2s, background .2s",
    boxSizing: "border-box" as const,
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px #0001" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Novo Projeto</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <input style={inputStyle} placeholder="Nome do projeto" value={title} onChange={e => setTitle(e.target.value)} required />
        <input style={inputStyle} placeholder="Descrição (opcional)" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <button type="submit" style={{
        background: "#0f172a", color: "#fff", border: "none", borderRadius: 10,
        padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}>
        Criar Projeto
      </button>
    </form>
  );
}