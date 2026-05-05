import React, { useEffect, useState } from "react";
import {
  completeTask,
  submitTask,
  uploadSubmissionFile,
  deleteSubmissionFile,
  uploadTaskFile,
  deleteTaskFile,
} from "../../services/taskService.ts";
import type {
  DisciplineTask,
  SubmissionFile,
  TaskFile,
  TaskSubmission,
} from "../../types/taskTypes.ts";
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
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>(task.files || []);
  const [userSubmission, setUserSubmission] = useState<TaskSubmission | null>(
    task.userSubmission || null
  );
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>(
    task.userSubmission?.files || []
  );
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setTaskFiles(task.files || []);
    setUserSubmission(task.userSubmission || null);
    setSubmissionFiles(task.userSubmission?.files || []);
  }, [task]);

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

  const handleSubmissionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const submission =
        userSubmission || (await submitTask(disciplineId, task.id));

      if (!userSubmission) {
        setUserSubmission(submission);
        setSubmissionFiles(submission.files || []);
      }

      const uploadedFile = await uploadSubmissionFile(
        disciplineId,
        task.id,
        submission.id,
        file
      );

      setSubmissionFiles((current) => [...current, uploadedFile]);
      setSuccess("Arquivo enviado com sucesso!");

      if (e.target) e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSubmissionFile = async (fileId: number) => {
    if (!userSubmission) return;

    try {
      setError(null);
      await deleteSubmissionFile(disciplineId, task.id, userSubmission.id, fileId);
      setSubmissionFiles((current) => current.filter((f) => f.id !== fileId));
      setSuccess("Arquivo deletado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar arquivo");
    }
  };

  const handleTaskFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const uploadedFile = await uploadTaskFile(disciplineId, task.id, file);
      setTaskFiles((current) => [...current, uploadedFile]);
      setSuccess("Arquivo da tarefa enviado com sucesso!");

      if (e.target) e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo da tarefa");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTaskFile = async (fileId: number) => {
    try {
      setError(null);
      await deleteTaskFile(disciplineId, task.id, fileId);
      setTaskFiles((current) => current.filter((file) => file.id !== fileId));
      setSuccess("Arquivo deletado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar arquivo da tarefa");
    }
  };

  const handleCompleteTask = async () => {
    try {
      setCompleting(true);
      setError(null);
      const updated = await completeTask(disciplineId, task.id);
      setUserSubmission(updated);
      setSubmissionFiles((current) => updated.files || current);
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
      <div>
        <h3 className="font-semibold text-base-content mb-3">Arquivos da Tarefa</h3>
        {taskFiles.length > 0 ? (
          <div className="space-y-2">
            {taskFiles.map((file) => (
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      downloadFile(`/uploads/${file.file_path.split("/").pop()}`, file.file_name)
                    }
                    className="btn btn-sm btn-ghost btn-square"
                  >
                    <Download size={18} />
                  </button>
                  {userRole === "professor" && (
                    <button
                      onClick={() => handleDeleteTaskFile(file.id)}
                      className="btn btn-sm btn-ghost btn-square text-error"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/60">Nenhum arquivo disponível para esta tarefa.</p>
        )}

        {userRole === "professor" && (
          <div className="mt-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Adicionar arquivo à tarefa</span>
              </div>
              <input
                aria-label="Enviar arquivo para a tarefa"
                type="file"
                onChange={handleTaskFileUpload}
                disabled={uploading}
                className="file-input file-input-bordered rounded-none w-full"
              />
            </label>
            <p className="text-sm text-base-content/60 mt-2">
              Apenas o professor que criou a tarefa pode adicionar ou remover arquivos.
            </p>
          </div>
        )}
      </div>

      {/* Submissão do Aluno */}
      {userRole === "student" && (
        <div className="space-y-4">
          <div className="divider divider-horizontal">Sua Submissão</div>

          {userSubmission ? (
            <div className="space-y-4">
              <div className="p-4 bg-base-200 rounded-none">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Status da Submissão</h3>
                  <span
                    className={`px-3 py-1 rounded-none text-sm font-medium ${
                      userSubmission.status === "completed"
                        ? "bg-success text-success-content"
                        : userSubmission.status === "submitted"
                          ? "bg-info text-info-content"
                          : "bg-warning text-warning-content"
                    }`}
                  >
                    {userSubmission.status === "completed"
                      ? "Concluída"
                      : userSubmission.status === "submitted"
                        ? "Enviada"
                        : "Pendente"}
                  </span>
                </div>

                {userSubmission.grade !== null && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Nota</span>
                    <p className="text-2xl font-bold text-success">
                      {userSubmission.grade.toFixed(2)}
                    </p>
                  </div>
                )}

                {userSubmission.feedback && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Feedback do Professor</span>
                    <p className="text-base-content mt-1">{userSubmission.feedback}</p>
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
                        <div className="flex items-center gap-2">
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
                            onClick={() => handleDeleteSubmissionFile(file.id)}
                            className="btn btn-sm btn-ghost btn-square text-error"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
                    onChange={handleSubmissionFileUpload}
                    disabled={uploading}
                    className="file-input file-input-bordered rounded-none w-full"
                  />
                </label>
              </div>

              {/* Botões de Ação */}
              {userSubmission.status !== "completed" && (
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
            <div className="space-y-4">
              <div className="p-4 bg-base-200 rounded-none">
                <p className="text-base-content/70">
                  Você ainda não iniciou a submissão desta tarefa. Envie um arquivo ou finalize a
                  tarefa para criar sua entrega.
                </p>
              </div>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Enviar arquivo</span>
                </div>
                <input
                  aria-label="Enviar arquivo da tarefa"
                  type="file"
                  onChange={handleSubmissionFileUpload}
                  disabled={uploading}
                  className="file-input file-input-bordered rounded-none w-full"
                />
              </label>

              <button
                onClick={handleCompleteTask}
                disabled={completing}
                className="btn btn-primary btn-block rounded-none"
              >
                {completing ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                Finalizar Tarefa
              </button>
            </div>
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
