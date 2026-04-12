import { useEffect, useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { getStatistics } from "../services/statisticsService";
import type { StatisticsData } from "../types/statisticsTypes";

export default function StatisticsScreen() {
  const [data, setData] = useState<StatisticsData>({
    totalStudents: 0,
    activeCourses: 0,
    graduationRate: 0,
    disciplinesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const stats = await getStatistics();
        setData(stats);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar estatísticas";
        setError(message);
        setData({
          totalStudents: 0,
          activeCourses: 0,
          graduationRate: 0,
          disciplinesCount: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarSimple />

      <div className="app-page min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">Estatística</h1>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Alunos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{data.totalStudents}</h2></div></div>
              <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Cursos Ativos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{data.activeCourses}</h2></div></div>
              <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Disciplinas</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{data.disciplinesCount}</h2></div></div>
              <div className="card app-panel shadow"><div className="card-body"><p className="app-text-muted">Perfis Completos</p><h2 className="text-3xl font-bold text-[var(--app-text)]">{data.graduationRate}%</h2></div></div>
            </div>

            <div className="card app-panel p-6 shadow">
              <h3 className="mb-3 font-semibold text-[var(--app-text)]">Indicadores</h3>
              <div className="mb-3">
                <div className="app-text-muted flex justify-between text-sm"><span>Conclusão de perfil</span><span>{data.graduationRate}%</span></div>
                <progress className="progress progress-primary w-full" value={data.graduationRate} max="100" />
              </div>
              <div className="mb-3">
                <div className="app-text-muted flex justify-between text-sm"><span>Cursos ativos (meta 20)</span><span>{data.activeCourses}/20</span></div>
                <progress className="progress progress-secondary w-full" value={data.activeCourses} max="20" />
              </div>
              <div>
                <div className="app-text-muted flex justify-between text-sm"><span>Disciplinas cadastradas (meta 15)</span><span>{data.disciplinesCount}/15</span></div>
                <progress className="progress progress-accent w-full" value={data.disciplinesCount} max="15" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
