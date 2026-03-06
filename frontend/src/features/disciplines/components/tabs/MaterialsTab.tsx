// components/tabs/MaterialsTab.tsx

import { toast } from "sonner";
import { useFiles } from "../../hooks/useFiles";
import { UploadFile } from "../files/UploadFile";
import { FileList } from "../files/FileList";

interface Props {
  disciplineId: number;
}

export function MaterialsTab({ disciplineId }: Readonly<Props>) {
  const { files, loading, uploading, upload, remove } = useFiles(disciplineId);

  const handleUpload = async (file: File) => {
    try {
      await upload(file);
      toast.success(`"${file.name}" enviado com sucesso!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar arquivo.");
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      await remove(fileId);
      toast.success("Arquivo excluído.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <UploadFile onUpload={handleUpload} uploading={uploading} />
      <FileList files={files} loading={loading} onDelete={handleDelete} />
    </div>
  );
}