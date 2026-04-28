export default function Hero2() {
  return (
    <section className="hero min-h-screen bg-white">
      <div className="hero-content text-center">
        <div className="mx-auto max-w-2xl space-y-6 px-4 md:space-y-8 lg:space-y-10">
          <h2 className="text-center text-4xl font-bold leading-tight text-slate-950 sm:text-5xl md:text-6xl">
            Gerencie seus estudos
            <br />
            <span className="inline-block whitespace-nowrap text-primary">
              <span className="text-slate-950">com</span> inteligência
            </span>
          </h2>

          <p className="text-lg leading-8 text-slate-700 md:text-2xl">
            Centralize aulas, tarefas, prazos e anotações em uma única plataforma
            moderna e intuitiva.
          </p>

          <p className="text-base leading-7 text-blue-700 md:text-lg">
            Tenha o controle total dos seus estudos, otimize seu tempo e conquiste
            mais resultados com menos esforço.
          </p>

          <div>
            <button className="btn min-h-[44px] border-0 bg-black px-8 py-3 text-white hover:bg-black/90">
              Comece Agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
