// src/features/disciplines/components/tabs/MaterialsTab.tsx

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { TEAMS } from "../../constants/teamsTheme";
import { getDisciplineFiles } from "../../../../services/disciplineFilesService";

function getFileType(mimeType: string): string {
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "pptx";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "docx";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "xlsx";
  return "file";
}
const typeColors: Record<string, string> = {
  pptx: "#D83B01", pdf: "#D13438", docx: "#0078D4", xlsx: "#217346", file: "#605E5C",
};
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

interface FileItem {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

interface Props {
  disciplineId: number;
}

export function MaterialsTab({ disciplineId }: Readonly<Props>) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!disciplineId) return;
    setLoading(true);
    getDisciplineFiles(disciplineId, { page: 1, limit: 50 })
      .then((r) => setFiles(r.data))
      .catch((err) => { console.error(err); setFiles([]); })
      .finally(() => setLoading(false));
  }, [disciplineId]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: TEAMS.textPrimary }}>{files.length} arquivos</span>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: TEAMS.purple, color: "#fff", border: "none", borderRadius: 4, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
          <Plus size={14} /> Adicionar arquivo
        </button>
      </div>

      <div style={{ background: TEAMS.white, border: `1px solid ${TEAMS.border}`, borderRadius: 8, overflow: "hidden" }}>
        {loading && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: TEAMS.textSecondary, fontSize: 14 }}>Carregando arquivos...</div>
        )}
        {!loading && files.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: TEAMS.textMuted, fontSize: 14 }}>Nenhum arquivo adicionado ainda.</div>
        )}
        {!loading && files.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", padding: "10px 16px", background: "#FAF9F8", borderBottom: `1px solid ${TEAMS.border}`, fontSize: 12, fontWeight: 600, color: TEAMS.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <span>Nome</span><span>Tamanho</span><span>Modificado</span><span></span>
            </div>
            {files.map((file, index) => {
              const fileType = getFileType(file.mime_type);
              return (
                <button
                  key={file.id}
                  onClick={() => console.log("Arquivo:", file.original_name)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", padding: "12px 16px", borderBottom: index < files.length - 1 ? `1px solid ${TEAMS.border}` : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s", background: "transparent", border: "none", fontFamily: "inherit", textAlign: "left", width: "100%" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAF9F8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: typeColors[fileType] + "18", color: typeColors[fileType], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      {fileType}
                    </div>
                    <span style={{ fontSize: 14, color: TEAMS.textPrimary, fontWeight: 500 }}>{file.original_name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{formatFileSize(file.size_bytes)}</span>
                  <span style={{ fontSize: 13, color: TEAMS.textSecondary }}>{new Date(file.created_at).toLocaleDateString("pt-BR")}</span>
                  <button style={{ border: "none", background: "transparent", cursor: "pointer", color: TEAMS.textMuted, padding: 4, borderRadius: 4 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}