// src/features/disciplines/components/tabs/MaterialsTab.tsx

import { useEffect, useState, useRef } from "react";
import { Plus, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import { TEAMS } from "../../constants/teamsTheme";
import { 
  listFiles as getDisciplineFiles, 
  uploadFile, 
  deleteFile,
  downloadFile,
  openFile
} from "../../services/filesService";
import type { Material } from "../../types/disciplineTypes";

function getFileType(mimeType: string): string {
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "pptx";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "docx";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "xlsx";
  return "file";
}

const typeColors: Record<string, string> = {
  pptx: "#D83B01",
  pdf: "#D13438",
  docx: "#0078D4",
  xlsx: "#217346",
  file: "#605E5C",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

interface Props {
  disciplineId: number;
}

export function MaterialsTab({ disciplineId }: Readonly<Props>) {
  const [files, setFiles] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadFiles() {
    try {
      setLoading(true);
      const r = await getDisciplineFiles(disciplineId, { page: 1, limit: 50 });
      setFiles(r.data);
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!disciplineId) return;
    loadFiles();
  }, [disciplineId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClose = () => setOpenDropdownId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  function openFileSelector() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadFile(disciplineId, file);
      await loadFiles();
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar arquivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(fileId: number) {
    if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;

    try {
      setLoading(true);
      await deleteFile(disciplineId, fileId);
      await loadFiles();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: TEAMS.textPrimary,
          }}
        >
          {files.length} arquivos
        </span>

        <button
          onClick={openFileSelector}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: TEAMS.purple,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          <Plus size={14} /> Adicionar arquivo
        </button>

        <input
          aria-label="Selecionar arquivo para material"
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <div
        style={{
          background: TEAMS.white,
          border: `1px solid ${TEAMS.border}`,
          borderRadius: 8,
          overflow: "visible", // Permitir que o dropdown saia do container
        }}
      >
        {loading && files.length === 0 && (
          <div
            style={{
              padding: "40px 16px",
              textAlign: "center",
              color: TEAMS.textSecondary,
              fontSize: 14,
            }}
          >
            Carregando arquivos...
          </div>
        )}

        {!loading && files.length === 0 && (
          <div
            style={{
              padding: "40px 16px",
              textAlign: "center",
              color: TEAMS.textMuted,
              fontSize: 14,
            }}
          >
            Nenhum arquivo adicionado ainda.
          </div>
        )}

        {files.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 80px",
                padding: "10px 16px",
                background: "#FAF9F8",
                borderBottom: `1px solid ${TEAMS.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: TEAMS.textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <span>Nome</span>
              <span>Tamanho</span>
              <span>Modificado</span>
              <span></span>
            </div>

            {files.map((file, index) => {
              const fileType = getFileType(file.mime_type);

              return (
                <div
                  key={file.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 80px",
                    padding: "12px 16px",
                    borderBottom:
                      index < files.length - 1
                        ? `1px solid ${TEAMS.border}`
                        : "none",
                    alignItems: "center",
                    transition: "background 0.15s",
                    background: "transparent",
                    fontFamily: "inherit",
                    position: "relative",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAF9F8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      flex: 1,
                    }}
                    onClick={() => downloadFile(disciplineId, file.id, file.original_name)}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        background: typeColors[fileType] + "18",
                        color: typeColors[fileType],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {fileType}
                    </div>

                    <span
                      style={{
                        fontSize: 14,
                        color: TEAMS.textPrimary,
                        fontWeight: 500,
                      }}
                    >
                      {file.original_name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 13,
                      color: TEAMS.textSecondary,
                    }}
                  >
                    {formatFileSize(file.size_bytes)}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      color: TEAMS.textSecondary,
                    }}
                  >
                    {new Date(file.created_at).toLocaleDateString("pt-BR")}
                  </span>

                  <div style={{ position: "relative", textAlign: "right" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === file.id ? null : file.id);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: TEAMS.textMuted,
                        padding: 8,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "auto",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEBE9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openDropdownId === file.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          background: "#fff",
                          boxShadow: "0px 8px 16px rgba(0,0,0,0.14)",
                          border: `1px solid ${TEAMS.border}`,
                          borderRadius: 4,
                          zIndex: 100,
                          minWidth: 160,
                          padding: "4px 0",
                        }}
                      >
                        <button
                          onClick={() => {
                            openFile(disciplineId, file.id);
                            setOpenDropdownId(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 13,
                            color: TEAMS.textPrimary,
                            textAlign: "left",
                            fontFamily: "inherit",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F2F1")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <ExternalLink size={14} /> Abrir
                        </button>

                        <button
                          onClick={() => handleDelete(file.id)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#A4262C",
                            textAlign: "left",
                            fontFamily: "inherit",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F2F1")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
