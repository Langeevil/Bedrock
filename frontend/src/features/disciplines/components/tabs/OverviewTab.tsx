import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { Discipline } from "../../services/disciplinesService";
import { listFiles as getDisciplineFiles } from "../../services/filesService";
import { listPosts as getDisciplinePosts } from "../../services/postsService";
import { Avatar } from "../Avatar";

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

        filesResponse.data.forEach(
          (file: { id: number; uploaded_by_name?: string; created_at: string }) => {
            activities.push({
              id: `file-${file.id}`,
              user: file.uploaded_by_name || "Usuário",
              action: "adicionou um novo arquivo",
              time: formatTimeAgo(new Date(file.created_at)),
              type: "file",
              timestamp: new Date(file.created_at),
            });
          },
        );

        postsResponse.data.forEach((post) => {
          activities.push({
            id: `post-${post.id}`,
            user: post.authorName,
            action: "publicou uma mensagem",
            time: formatTimeAgo(new Date(post.createdAt)),
            type: "post",
            timestamp: new Date(post.createdAt),
          });
        });

        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 5));
      })
      .catch((err) => {
        console.error("Erro ao carregar atividades:", err);
        setRecentActivities([]);
      })
      .finally(() => setLoadingActivities(false));
  }, [discipline.id]);

  return (
    <div className="flex flex-col gap-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--app-accent)] to-[#4f7fff] px-6 py-6 text-white shadow-sm">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute bottom-[-1.5rem] right-10 h-20 w-20 rounded-full bg-white/10" />
        <p className="relative text-sm font-medium text-white/80">Bem-vindo à</p>
        <h2 className="relative mt-1 text-2xl font-semibold">{discipline.name}</h2>
        <p className="relative mt-2 text-sm text-white/80">
          {discipline.professor} · {discipline.code}
        </p>
      </section>

      {fileCount !== null && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-bg-muted)] text-[var(--app-accent)]">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-xl font-semibold text-[var(--app-text)]">{fileCount}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Arquivos</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Descrição
        </div>
        <p className="text-sm leading-7 text-[var(--app-text-muted)]">
          Esta é a página inicial da disciplina. Adicione descrições, avisos ou links
          úteis relacionados ao curso aqui. Os alunos podem usar as abas acima para
          acessar materiais, discutir no chat e verificar as configurações.
        </p>
      </section>

      {!loadingActivities && recentActivities.length > 0 && (
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-5 shadow-sm">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Atividade Recente
          </div>
          <div className="space-y-3">
            {recentActivities.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 pb-3 ${
                  index < recentActivities.length - 1
                    ? "border-b border-[var(--app-border)]"
                    : ""
                }`}
              >
                <Avatar name={item.user} size={30} />
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold text-[var(--app-text)]">{item.user}</span>{" "}
                  <span className="text-[var(--app-text-muted)]">{item.action}</span>
                </div>
                <span className="shrink-0 text-xs text-[var(--app-text-muted)]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
