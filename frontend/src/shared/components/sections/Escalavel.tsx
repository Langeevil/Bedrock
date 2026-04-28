import universidade from "../../../assets/icons/universidade.png";
import usergroup from "../../../assets/icons/fa--group.png";
import building from "../../../assets/icons/mdi--building.png";

export default function Escalavel() {
  return (
    <section id="scale" className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <h2 className="text-center font-poppins text-3xl font-semibold text-slate-950 sm:text-4xl">
        Totalmente
      </h2>
      <p className="mb-6 text-center font-poppins text-4xl text-[#3558ff] underline sm:text-5xl md:text-6xl">
        Escalável!
      </p>
      <h3 className="mb-8 mt-4 text-center font-poppins text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
        Desenvolvido para suportar qualquer tipo de infraestrutura
      </h3>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
        <div className="flex flex-col items-center">
          <img src={usergroup} alt="Segmento de pequenas empresas" />
          <span className="mt-6 text-center text-2xl font-medium text-slate-900 sm:text-3xl">
            Pequenas
            <br />
            Empresas
          </span>
        </div>
        <div className="flex flex-col items-center">
          <img src={universidade} alt="Segmento de instituições acadêmicas" />
          <span className="mt-6 text-center text-2xl font-medium text-slate-900 sm:text-3xl">
            Instituições
            <br />
            Acadêmicas
          </span>
        </div>
        <div className="flex flex-col items-center">
          <img src={building} alt="Segmento de empresas de grande porte" />
          <span className="mt-6 text-center text-2xl font-medium text-slate-900 sm:text-3xl">
            Empresas de
            <br />
            Grande Porte
          </span>
        </div>
      </div>
    </section>
  );
}
