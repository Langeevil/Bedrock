import { useEffect, useState } from "react";
import { SidebarSimple } from "../components/sidebar-simple";
import { getDashboardStats } from "../services/dashboardService";
import { listDisciplines } from "../features/disciplines/services/disciplinesService";

export default function EstatisticaScreen() {
  const [students, setStudents] = useState(0);
  const [courses, setCourses] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [disciplinesCount, setDisciplinesCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [stats, disciplines] = await Promise.all([getDashboardStats(), listDisciplines()]);
        setStudents(stats.totalStudents);
        setCourses(stats.activeCourses);
        setCompletion(stats.graduationRate);
        setDisciplinesCount(disciplines.data.length);
      } catch {
        setStudents(0);
        setCourses(0);
        setCompletion(0);
        setDisciplinesCount(0);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex h-screen">
      <SidebarSimple />

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Estatistica</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="card bg-white shadow"><div className="card-body"><p className="text-slate-500">Alunos</p><h2 className="text-3xl font-bold text-slate-800">{students}</h2></div></div>
          <div className="card bg-white shadow"><div className="card-body"><p className="text-slate-500">Cursos Ativos</p><h2 className="text-3xl font-bold text-slate-800">{courses}</h2></div></div>
          <div className="card bg-white shadow"><div className="card-body"><p className="text-slate-500">Disciplinas</p><h2 className="text-3xl font-bold text-slate-800">{disciplinesCount}</h2></div></div>
          <div className="card bg-white shadow"><div className="card-body"><p className="text-slate-500">Perfis Completos</p><h2 className="text-3xl font-bold text-slate-800">{completion}%</h2></div></div>
        </div>

        <div className="card bg-white shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Indicadores</h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-slate-600"><span>Conclusao de perfil</span><span>{completion}%</span></div>
            <progress className="progress progress-primary w-full" value={completion} max="100" />
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-slate-600"><span>Cursos ativos (meta 20)</span><span>{courses}/20</span></div>
            <progress className="progress progress-secondary w-full" value={courses} max="20" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-slate-600"><span>Disciplinas cadastradas (meta 15)</span><span>{disciplinesCount}/15</span></div>
            <progress className="progress progress-accent w-full" value={disciplinesCount} max="15" />
          </div>
        </div>
      </div>
    </div>
  );
}
