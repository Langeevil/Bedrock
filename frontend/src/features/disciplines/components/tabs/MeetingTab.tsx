import FeatureInDevelopmentPage from "../../../../shared/components/FeatureInDevelopmentPage";
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
    <FeatureInDevelopmentPage
      title="Reuniões acadêmicas"
      category="Placeholder"
      compact
      notes={[
        "Reuniões em tempo real, áudio e vídeo continuarão no roadmap.",
        "Nesta etapa o Bedrock mantém foco em comunicação textual, diretório e governança institucional.",
      ]}
    />
  );
}
