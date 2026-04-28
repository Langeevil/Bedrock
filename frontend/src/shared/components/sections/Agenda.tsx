import agenda from "../../../assets/agenda.png";

export default function Agenda() {
  return (
    <section id="demo" className="hero min-h-screen bg-zinc-50">
      <div className="hero-content flex-col gap-8 lg:flex-row lg:gap-12">
        <img
          src={agenda}
          alt="Prévia da agenda acadêmica do Bedrock"
          className="w-full max-w-xl object-cover lg:max-w-[650px]"
        />
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Sua agenda acadêmica organizada em um só lugar
          </h2>
          <p className="py-8 text-lg leading-8 text-slate-700 sm:text-xl lg:text-2xl">
            Organize suas aulas, tarefas e prazos com praticidade e foco e conquiste
            sua rotina acadêmica com leveza e produtividade.
          </p>
        </div>
      </div>
    </section>
  );
}
