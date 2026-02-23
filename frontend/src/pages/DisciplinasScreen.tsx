import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SidebarSimple } from "../components/sidebar-simple";
import {
  createDiscipline,
  listDisciplines,
  removeDiscipline,
  updateDiscipline,
  type Discipline,
} from "../services/disciplinesService";

export default function DisciplinesScreen() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", professor: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDisciplines() {
      try {
        setLoading(true);
        const data = await listDisciplines();
        setDisciplines(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar disciplinas.");
      } finally {
        setLoading(false);
      }
    }

    loadDisciplines();
  }, []);

  const filteredDisciplines = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return disciplines.filter(
      (discipline) =>
        discipline.name.toLowerCase().includes(term) ||
        discipline.code.toLowerCase().includes(term) ||
        discipline.professor.toLowerCase().includes(term)
    );
  }, [disciplines, searchTerm]);

  const handleAddDiscipline = () => {
    setEditingDiscipline(null);
    setFormData({ name: "", code: "", professor: "" });
    setIsModalOpen(true);
  };

  const handleEditDiscipline = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setFormData({
      name: discipline.name,
      code: discipline.code,
      professor: discipline.professor,
    });
    setIsModalOpen(true);
  };

  const handleDeleteDiscipline = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta disciplina?")) return;

    try {
      await removeDiscipline(id);
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir disciplina.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        professor: formData.professor.trim(),
      };

      if (editingDiscipline) {
        const updated = await updateDiscipline(editingDiscipline.id, payload);
        setDisciplines((prev) => prev.map((d) => (d.id === editingDiscipline.id ? updated : d)));
      } else {
        const created = await createDiscipline(payload);
        setDisciplines((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      setEditingDiscipline(null);
      setFormData({ name: "", code: "", professor: "" });
    } catch (err: any) {
      alert(err.message || "Erro ao salvar disciplina.");
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Disciplinas</h1>
          <button className="btn btn-primary btn-lg" onClick={handleAddDiscipline}>
            Adicionar Disciplina
          </button>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar disciplinas..."
            className="input input-bordered input-lg w-full max-w-md bg-white text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}
        {loading && <div className="loading loading-spinner loading-lg text-primary" />}

        {!loading && filteredDisciplines.length === 0 && (
          <div className="card bg-white shadow p-6 text-slate-700">
            Nenhuma disciplina cadastrada ainda.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredDisciplines.map((discipline) => (
            <div key={discipline.id} className="card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body">
                <h2 className="card-title text-slate-900">{discipline.name}</h2>
                <p className="text-slate-600">Codigo: {discipline.code}</p>
                <p className="text-slate-600">Professor: {discipline.professor}</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline btn-sm" onClick={() => handleEditDiscipline(discipline)}>
                    Editar
                  </button>
                  <button className="btn btn-outline btn-error btn-sm" onClick={() => handleDeleteDiscipline(discipline.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box bg-white text-slate-800">
              <h3 className="font-bold text-lg">
                {editingDiscipline ? "Editar Disciplina" : "Adicionar Nova Disciplina"}
              </h3>

              <form onSubmit={handleSubmit} className="py-4">
                <div className="form-control mb-4">
                  <label htmlFor="discipline-name" className="label">
                    <span className="label-text text-slate-700">Nome</span>
                  </label>
                  <input
                    id="discipline-name"
                    type="text"
                    placeholder="Nome da Disciplina"
                    className="input input-bordered bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label htmlFor="discipline-code" className="label">
                    <span className="label-text text-slate-700">Codigo</span>
                  </label>
                  <input
                    id="discipline-code"
                    type="text"
                    placeholder="Codigo da Disciplina"
                    className="input input-bordered bg-white"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label htmlFor="discipline-professor" className="label">
                    <span className="label-text text-slate-700">Professor</span>
                  </label>
                  <input
                    id="discipline-professor"
                    type="text"
                    placeholder="Nome do Professor"
                    className="input input-bordered bg-white"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDiscipline ? "Atualizar" : "Adicionar"}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

