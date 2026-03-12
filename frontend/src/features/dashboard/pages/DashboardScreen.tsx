// src/features/dashboard/pages/DashboardScreen.tsx

import { useEffect, useState } from "react";
import ProfileModal from "../../auth/components/ProfileModal";
import { getMe } from "../../auth/services/authService";
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

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getMe();
        if (!user.role) setShowModal(true);
      } catch {
        setShowModal(true);
      }
    }

    loadUser();
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
    <div className="flex h-screen">
      <SidebarSimple />

      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}

      <div className="flex-grow p-8 overflow-y-auto bg-[#f4f7fc]">
        <h1 className="text-3xl font-semibold text-slate-800 mb-8">Dashboard Overview</h1>

        {error && (
          <div className="alert alert-warning mb-6 bg-amber-100 border-amber-300 text-amber-900">
            <span>{error}</span>
          </div>
        )}

        <div className="stats stats-vertical lg:stats-horizontal shadow mb-8 bg-white">
          <div className="stat">
            <div className="stat-title text-slate-500">Total Students</div>
            <div className="stat-value text-primary">{stats.totalStudents}</div>
            <div className="stat-desc text-slate-500">Dados atuais de alunos com perfil.</div>
          </div>

          <div className="stat">
            <div className="stat-title text-slate-500">Active Courses</div>
            <div className="stat-value text-secondary">{stats.activeCourses}</div>
            <div className="stat-desc text-slate-500">Disciplinas cadastradas por você.</div>
          </div>

          <div className="stat">
            <div className="stat-title text-slate-500">Profile Completion</div>
            <div className="stat-value text-accent">{stats.graduationRate}%</div>
            <div className="stat-desc text-slate-500">Usuários com perfil completo.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
