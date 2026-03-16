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

      <div className="app-page flex-grow overflow-y-auto p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">Biblioteca</h1>

        <div className="card app-panel mb-6 flex flex-col gap-3 p-4 shadow md:flex-row">
          <input
            className="input input-bordered app-input flex-1"
            placeholder="Buscar por título ou área"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="select select-bordered app-input"
            value={type}
            onChange={(event) => setType(event.target.value as "todos" | Resource["type"])}
          >
            <option value="todos">Todos os tipos</option>
            <option value="artigo">Artigos</option>
            <option value="video">Vídeos</option>
            <option value="ebook">E-books</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="card app-panel shadow">
              <div className="card-body">
                <h2 className="card-title text-[var(--app-text)]">{item.title}</h2>
                <p className="app-text-muted">Área: {item.subject}</p>
                <div className="badge badge-outline border-[var(--app-border)] text-[var(--app-text)]">
                  {item.type}
                </div>
                <div className="card-actions mt-2 justify-end">
                  <button className="btn btn-primary btn-sm">Abrir</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card app-panel app-text-muted p-6 shadow">Nenhum material encontrado.</div>
        )}
      </div>
    </div>
  );
}
