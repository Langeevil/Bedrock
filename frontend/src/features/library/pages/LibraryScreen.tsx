// src/features/library/pages/LibraryScreen.tsx

import { useMemo, useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import type { Resource } from "../types/libraryTypes";

const resources: Resource[] = [
  { id: 1, title: "Guia de React", type: "ebook", subject: "Front-end" },
  { id: 2, title: "Node API Patterns", type: "video", subject: "Back-end" },
  { id: 3, title: "Banco de Dados SQL", type: "artigo", subject: "Dados" },
  { id: 4, title: "UX para Produtos", type: "ebook", subject: "Design" },
];

export default function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"todos" | Resource["type"]>("todos");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return resources.filter((item) => {
      const matchType = type === "todos" || item.type === type;
      const matchSearch =
        item.title.toLowerCase().includes(term) || item.subject.toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [search, type]);

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Biblioteca</h1>

        <div className="card bg-white shadow p-4 mb-6 flex flex-col md:flex-row gap-3">
          <input
            className="input input-bordered bg-white text-slate-800 flex-1"
            placeholder="Buscar por título ou área"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered bg-white"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="todos">Todos os tipos</option>
            <option value="artigo">Artigos</option>
            <option value="video">Vídeos</option>
            <option value="ebook">E-books</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="card bg-white shadow">
              <div className="card-body">
                <h2 className="card-title text-slate-900">{item.title}</h2>
                <p className="text-slate-600">Área: {item.subject}</p>
                <div className="badge badge-outline text-slate-700">{item.type}</div>
                <div className="card-actions justify-end mt-2">
                  <button className="btn btn-primary btn-sm">Abrir</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card bg-white shadow p-6 text-slate-600">Nenhum material encontrado.</div>
        )}
      </div>
    </div>
  );
}
