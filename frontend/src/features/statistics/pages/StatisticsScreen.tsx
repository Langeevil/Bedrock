import { SidebarSimple } from "../../../components/sidebar-simple";
import FeatureInDevelopmentProgress from "../../../shared/components/FeatureInDevelopmentProgress";

export default function StatisticsScreen() {
  return (
    <div className="app-page flex h-dvh overflow-hidden">
      <SidebarSimple />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <FeatureInDevelopmentProgress
          title="Estatísticas e relatórios avançados"
          category="Em construção"
          progressValue={68}
          statusLabel="Estrutura analítica"
          progressLabel="Interface em evolução"
          notes={[
            "Relatórios avançados, gráficos complexos e exportações de dados seguem no roadmap.",
            "Nesta fase a prioridade permanece em chat, diretório, multi-instituição, permissões e migrations.",
          ]}
        />
      </main>
    </div>
  );
}
