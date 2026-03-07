// src/features/disciplines/components/tabs/OverviewTab.tsx

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { Discipline } from "../../services/disciplinesService";
import { Avatar } from "../Avatar";
import { TEAMS } from "../../constants/teamsTheme";
import { getDisciplinePosts } from "../../../../services/disciplinePostsService";
import { getDisciplineFiles } from "../../../../services/disciplineFilesService";

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "há poucos minutos";
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString("pt-BR");
}

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "file" | "post" | "user";
  timestamp: Date;
}

interface Props {
  discipline: Discipline;
}

export function OverviewTab({ discipline }: Readonly<Props>) {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [fileCount, setFileCount] = useState<number | null>(null);

  useEffect(() => {
    if (!discipline.id) return;
    setLoadingActivities(true);
    Promise.all([
      getDisciplineFiles(discipline.id, { page: 1, limit: 10 }),
      getDisciplinePosts(discipline.id, 1, 10),
    ])
      .then(([filesResponse, postsResponse]) => {
        setFileCount(filesResponse.pagination?.totalItems ?? filesResponse.data.length);
        const activities: Activity[] = [];
        filesResponse.data.forEach((file: { id: number; uploaded_by_name?: string; created_at: string }) => {
          activities.push({ id: `file-${file.id}`, user: file.uploaded_by_name || "Usuário", action: "adicionou um novo arquivo", time: formatTimeAgo(new Date(file.created_at)), type: "file", timestamp: new Date(file.created_at) });
        });
        postsResponse.data.forEach((post: { id: number; author?: { nome: string }; created_at: string }) => {
          activities.push({ id: `post-${post.id}`, user: post.author?.nome || "Usuário", action: "publicou uma mensagem", time: formatTimeAgo(new Date(post.created_at)), type: "post", timestamp: new Date(post.created_at) });
        });
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 5));
      })
      .catch((err) => { console.error("Erro ao carregar atividades:", err); setRecentActivities([]); })
      .finally(() => setLoadingActivities(false));
  }, [discipline.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg, #6264A7 0%, #8764B8 100%)", borderRadius: 8, padding: "24px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>Bem-vindo à</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{discipline.name}</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>{discipline.professor} · {discipline.code}</div>
      </div>

      {/* Stats */}
      {fileCount !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: TEAMS.purple, background: TEAMS.purpleLight, borderRadius: 8, padding: 8, display: "flex" }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEAMS.textPrimary, lineHeight: 1 }}>{fileCount}</div>
              <div style={{ fontSize: 12, color: TEAMS.textSecondary, marginTop: 2 }}>Arquivos</div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Descrição</div>
        <p style={{ fontSize: 14, color: TEAMS.textSecondary, lineHeight: 1.6, margin: 0 }}>
          Esta é a página inicial da disciplina. Adicione descrições, avisos ou links úteis relacionados ao curso aqui. Os alunos podem usar as abas acima para acessar materiais, discutir no chat e verificar as configurações.
        </p>
      </div>

      {/* Recent activity */}
      {!loadingActivities && recentActivities.length > 0 && (
        <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>Atividade Recente</div>
          {recentActivities.map((item, idx) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: idx < recentActivities.length - 1 ? `1px solid ${TEAMS.border}` : "none" }}>
              <Avatar name={item.user} size={30} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEAMS.textPrimary }}>{item.user}</span>{" "}
                <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{item.action}</span>
              </div>
              <span style={{ fontSize: 12, color: TEAMS.textMuted }}>{item.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}