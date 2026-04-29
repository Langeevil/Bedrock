import FeatureInDevelopmentProgress from "../../../../shared/components/FeatureInDevelopmentProgress";
import type { Discipline } from "../../services/disciplinesService";

interface Props {
  discipline: Discipline;
  currentUserEmail: string;
  currentUserName: string;
}

export function MeetingTab({
  discipline: _discipline,
  currentUserEmail: _currentUserEmail,
  currentUserName: _currentUserName,
}: Readonly<Props>) {
  return (
    <FeatureInDevelopmentProgress
      title="Reuniões acadêmicas"
      category="Em construção"
      compact
      progressValue={52}
      statusLabel="Colaboração síncrona"
      progressLabel="Planejamento ativo"
      notes={[
        "Reuniões em tempo real, áudio e vídeo continuarão no roadmap.",
        "Nesta etapa o Bedrock mantém foco em comunicação textual, diretório e governança institucional.",
      ]}
    />
  );
}
