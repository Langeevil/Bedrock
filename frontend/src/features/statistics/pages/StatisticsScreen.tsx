import { useEffect, useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { getDashboardStats } from "../../dashboard/services/dashboardService";
import { listDisciplines } from "../../disciplines/services/disciplinesService";

export default function StatisticsScreen() {
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

      <div className="app-page flex-grow overflow-y-auto p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">Estatística</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Alunos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{students}</h2></div></div>
          <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Cursos Ativos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{courses}</h2></div></div>
          <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Disciplinas</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{disciplinesCount}</h2></div></div>
          <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Perfis Completos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{completion}%</h2></div></div>
        </div>

        <div className="card app-panel p-6 shadow">
          <h3 className="mb-3 font-semibold text-[var(--app-text)]">Indicadores</h3>
          <div className="mb-3">
            <div className="app-text-muted flex justify-between text-sm"><span>Conclusão de perfil</span><span>{completion}%</span></div>
            <progress className="progress progress-primary w-full" value={completion} max="100" />
          </div>
          <div className="mb-3">
            <div className="app-text-muted flex justify-between text-sm"><span>Cursos ativos (meta 20)</span><span>{courses}/20</span></div>
            <progress className="progress progress-secondary w-full" value={courses} max="20" />
          </div>
          <div>
            <div className="app-text-muted flex justify-between text-sm"><span>Disciplinas cadastradas (meta 15)</span><span>{disciplinesCount}/15</span></div>
            <progress className="progress progress-accent w-full" value={disciplinesCount} max="15" />
          </div>
        </div>
      </div>
    </div>
  );
}
