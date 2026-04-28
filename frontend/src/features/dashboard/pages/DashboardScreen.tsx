import { useEffect, useState } from "react";
import ProfileModal from "../../auth/components/ProfileModal";
import { getMe } from "../../auth/services/authService";
import { subscribeAuthSession } from "../../../shared/authSession";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { getDashboardStats } from "../services/dashboardService";
import type { DashboardStats } from "../types/dashboardTypes";

export default function DashboardScreen() {
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    graduationRate: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const checkUserRole = async () => {
    try {
      const user = await getMe();
      if (!user.role) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch {
      setShowModal(true);
    }
  };

  useEffect(() => {
    checkUserRole();

    // Subscribe to auth changes to re-check if role was updated
    const unsubscribe = subscribeAuthSession(checkUserRole);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Não foi possível carregar estatísticas.");
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden">
      <SidebarSimple />

      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}

      <div className="app-page min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-[var(--app-text)] sm:text-3xl">Dashboard Overview</h1>

        {error && (
          <div className="alert alert-warning mb-6 border-amber-300 bg-amber-100 text-amber-900">
            <span>{error}</span>
          </div>
        )}

        <div className="stats stats-vertical app-panel mb-8 w-full shadow lg:stats-horizontal">
          <div className="stat">
            <div className="stat-title app-text-muted">Total Students</div>
            <div className="stat-value text-primary">{stats.totalStudents}</div>
            <div className="stat-desc app-text-muted">Dados atuais de alunos com perfil.</div>
          </div>

          <div className="stat">
            <div className="stat-title app-text-muted">Active Courses</div>
            <div className="stat-value text-secondary">{stats.activeCourses}</div>
            <div className="stat-desc app-text-muted">Disciplinas cadastradas por você.</div>
          </div>

          <div className="stat">
            <div className="stat-title app-text-muted">Profile Completion</div>
            <div className="stat-value text-accent">{stats.graduationRate}%</div>
            <div className="stat-desc app-text-muted">Usuários com perfil completo.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
