import { useMemo, useState, type FormEvent } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import type { Project } from "../types/projectTypes";

const storageKey = "bedrock_projects";

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>(loadProjects());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const visibleProjects = useMemo(() => {
    const term = search.toLowerCase();
    return projects.filter(
      (p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }, [projects, search]);

  function persist(next: Project[]) {
    setProjects(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function addProject(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    const next: Project[] = [
      {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        status: "planejado",
      },
      ...projects,
    ];

    persist(next);
    setTitle("");
    setDescription("");
  }

  function updateStatus(id: number, status: Project["status"]) {
    persist(projects.map((project) => (project.id === id ? { ...project, status } : project)));
  }

  function removeProject(id: number) {
    persist(projects.filter((project) => project.id !== id));
  }

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="app-page flex-grow overflow-y-auto p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">Projetos</h1>

        <form onSubmit={addProject} className="card app-panel mb-6 grid gap-3 p-4 shadow md:grid-cols-3">
          <input
            className="input input-bordered app-input"
            placeholder="Nome do projeto"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="input input-bordered app-input"
            placeholder="Descrição rápida"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Adicionar projeto
          </button>
        </form>

        <div className="mb-6">
          <input
            className="input input-bordered app-input w-full max-w-md"
            placeholder="Buscar projeto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <div key={project.id} className="card app-panel shadow">
              <div className="card-body">
                <h2 className="card-title text-[var(--app-text)]">{project.title}</h2>
                <p className="app-text-muted">{project.description || "Sem descrição"}</p>
                <select
                  className="select select-bordered app-input mt-2"
                  value={project.status}
                  onChange={(event) =>
                    updateStatus(project.id, event.target.value as Project["status"])
                  }
                >
                  <option value="planejado">Planejado</option>
                  <option value="em andamento">Em andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
                <div className="card-actions mt-3 justify-end">
                  <button
                    className="btn btn-error btn-outline btn-sm"
                    onClick={() => removeProject(project.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleProjects.length === 0 && (
          <div className="card app-panel app-text-muted p-6 shadow">Nenhum projeto encontrado.</div>
        )}
      </div>
    </div>
  );
}
