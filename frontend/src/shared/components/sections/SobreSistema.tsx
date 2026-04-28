export default function SobreSistema() {
  return (
    <section id="features" className="relative overflow-hidden bg-white px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Conectando toda a comunidade acadêmica
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Nosso sistema conecta alunos, professores e administração em uma única
              plataforma. Uma solução pensada para colaboração, organização e
              acompanhamento de atividades, tudo com segurança e facilidade de uso.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-200"
                href="#demo"
                aria-label="Solicitar demonstração"
              >
                Solicitar demonstração
              </a>

              <a
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
                href="#features"
              >
                Ver funcionalidades
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-4 text-sm text-slate-700">
              <li className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Comunicação em tempo real
              </li>
              <li className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                Agenda e notificações
              </li>
              <li className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                Relatórios e métricas
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md sm:max-w-xl lg:mr-0 lg:max-w-none">
            <video
              src="/dashboard.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-label="Prévia animada do painel do sistema Bedrock"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
