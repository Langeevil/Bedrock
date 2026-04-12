import React, { useState } from "react";
import { completeTask, uploadSubmissionFile, deleteSubmissionFile } from "../../services/taskService.ts";
import type { DisciplineTask, SubmissionFile } from "../../types/taskTypes.ts";
import { Download, Trash2, Check, FileText, Loader } from "lucide-react";

interface TaskDetailProps {
  task: DisciplineTask;
  disciplineId: number;
  userRole: "professor" | "student";
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  disciplineId,
  userRole,
}) => {
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>(
    task.userSubmission?.files || []
  );
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sem prazo";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task.userSubmission) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const uploadedFile = await uploadSubmissionFile(
        disciplineId,
        task.id,
        task.userSubmission.id,
        file
      );

      setSubmissionFiles([...submissionFiles, uploadedFile]);
      setSuccess("Arquivo enviado com sucesso!");

      // Reset input
      if (e.target) e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!task.userSubmission) return;

    try {
      setError(null);
      await deleteSubmissionFile(disciplineId, task.id, task.userSubmission.id, fileId);
      setSubmissionFiles(submissionFiles.filter((f) => f.id !== fileId));
      setSuccess("Arquivo deletado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar arquivo");
    }
  };

  const handleCompleteTask = async () => {
    if (!task.userSubmission) return;

    try {
      setCompleting(true);
      setError(null);
      await completeTask(disciplineId, task.id);
      setSuccess("Tarefa concluída com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao concluir tarefa");
    } finally {
      setCompleting(false);
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">{task.title}</h2>
        <p className="text-base-content/70 mt-2">{task.description}</p>

        <div className="mt-4 p-4 bg-base-200 rounded-none">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-base-content/60">Prazo</span>
              <p className="text-base-content mt-1">{formatDate(task.due_date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-base-content/60">Criado por</span>
              <p className="text-base-content mt-1">{task.created_by_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error rounded-none">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success rounded-none">
          <span>{success}</span>
        </div>
      )}

      {/* Arquivos da Tarefa */}
      {task.files && task.files.length > 0 && (
        <div>
          <h3 className="font-semibold text-base-content mb-3">Arquivos da Tarefa</h3>
          <div className="space-y-2">
            {task.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-base-200 rounded-none">
                <div className="flex items-center gap-3 flex-1">
                  <FileText size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base-content truncate">{file.file_name}</p>
                    <p className="text-sm text-base-content/60">
                      {(file.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    downloadFile(`/uploads/${file.file_path.split("/").pop()}`, file.file_name)
                  }
                  className="btn btn-sm btn-ghost btn-square"
                >
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissão do Aluno */}
      {userRole === "student" && (
        <div className="space-y-4">
          <div className="divider divider-horizontal">Sua Submissão</div>

          {task.userSubmission ? (
            <div className="space-y-4">
              <div className="p-4 bg-base-200 rounded-none">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Status da Submissão</h3>
                  <span
                    className={`px-3 py-1 rounded-none text-sm font-medium ${
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
                </div>

                {task.userSubmission.grade !== null && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Nota</span>
                    <p className="text-2xl font-bold text-success">{task.userSubmission.grade.toFixed(2)}</p>
                  </div>
                )}

                {task.userSubmission.feedback && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Feedback do Professor</span>
                    <p className="text-base-content mt-1">{task.userSubmission.feedback}</p>
                  </div>
                )}
              </div>

              {/* Arquivos de Submissão */}
              <div>
                <h4 className="font-medium text-base-content mb-3">Seus Arquivos</h4>
                {submissionFiles.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {submissionFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-base-200 rounded-none"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText size={20} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base-content truncate">{file.file_name}</p>
                            <p className="text-sm text-base-content/60">
                              {(file.file_size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            downloadFile(
                              `/uploads/${file.file_path.split("/").pop()}`,
                              file.file_name
                            )
                          }
                          className="btn btn-sm btn-ghost btn-square"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="btn btn-sm btn-ghost btn-square text-error"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60 mb-4">Nenhum arquivo enviado</p>
                )}

                {/* Upload */}
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Enviar arquivo</span>
                  </div>
                  <input
                    aria-label="Enviar arquivo da tarefa"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="file-input file-input-bordered rounded-none w-full"
                  />
                </label>
              </div>

              {/* Botões de Ação */}
              {task.userSubmission.status !== "completed" && (
                <button
                  onClick={handleCompleteTask}
                  disabled={completing}
                  className="btn btn-primary btn-block rounded-none"
                >
                  {completing ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                  Finalizar Tarefa
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-base-content/60">Carregando informações de submissão...</p>
          )}
        </div>
      )}

      {/* Professor - Ver Submissões */}
      {userRole === "professor" && task.allSubmissions && (
        <div>
          <div className="divider divider-horizontal">Submissões dos Alunos</div>
          <div className="space-y-3">
            {task.allSubmissions.length > 0 ? (
              task.allSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 bg-base-200 rounded-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-base-content">{submission.user_name}</p>
                      <p className="text-sm text-base-content/60">{submission.user_email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-none text-sm font-medium ${
                        submission.status === "completed"
                          ? "bg-success text-success-content"
                          : submission.status === "submitted"
                            ? "bg-info text-info-content"
                            : "bg-warning text-warning-content"
                      }`}
                    >
                      {submission.status === "completed"
                        ? "Concluída"
                        : submission.status === "submitted"
                          ? "Enviada"
                          : "Pendente"}
                    </span>
                  </div>
                  {submission.grade !== null && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Nota:</span> {submission.grade.toFixed(2)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-base-content/60">Nenhuma submissão ainda</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
