import React, { useState, useEffect } from "react";
import { getTasks } from "../../services/taskService.ts";
import type { DisciplineTask } from "../../types/taskTypes.ts";
import { Calendar, FileText, Loader } from "lucide-react";

interface TaskListProps {
  disciplineId: number;
  userRole: "professor" | "student";
  onSelectTask: (task: DisciplineTask) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ disciplineId, userRole, onSelectTask }) => {
  const [tasks, setTasks] = useState<DisciplineTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks(disciplineId);
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [disciplineId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sem prazo";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-error p-4">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div className="p-4 text-center text-base-content/60">Nenhuma tarefa encontrada</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onSelectTask(task)}
          className="p-4 border border-base-300 rounded-none hover:bg-base-200 cursor-pointer transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-base-content">{task.title}</h3>
              <p className="text-sm text-base-content/70 mt-1">{task.description}</p>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span
                    className={isOverdue(task.due_date) ? "text-error font-medium" : ""}
                  >
                    {formatDate(task.due_date)}
                  </span>
                </div>

                {task.files && task.files.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>{task.files.length} arquivo(s)</span>
                  </div>
                )}

                {userRole === "professor" && (
                  <span className="text-info">
                    {task.submission_count} submissão(ões)
                  </span>
                )}

                {userRole === "student" && task.userSubmission && (
                  <span
                    className={`px-2 py-1 rounded-none text-xs font-medium ${
                      task.userSubmission.status === "completed"
                        ? "bg-success text-success-content"
                        : task.userSubmission.status === "submitted"
                          ? "bg-info text-info-content"
                          : "bg-warning text-warning-content"
                    }`}
                  >
                    {task.userSubmission.status === "completed"
                      ? "Concluída"
                      : task.userSubmission.status === "submitted"
                        ? "Enviada"
                        : "Pendente"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
