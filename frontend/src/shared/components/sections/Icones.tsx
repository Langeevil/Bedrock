import organizacao from "../../../assets/icons/companhia.png";
import plano from "../../../assets/icons/planejamento.png";
import universidade from "../../../assets/icons/universidade.png";

export default function Icones() {
  return (
    <section
      id="segments"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-t from-white to-blue-200 px-4 py-12"
    >
      <h2 className="mb-12 text-center text-2xl font-semibold text-slate-950 sm:text-3xl 2xl:text-5xl">
        Um sistema feito para os <br /> seguintes segmentos
      </h2>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <article className="card cursor-pointer bg-white text-center shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl group">
          <div className="card-body items-center">
            <img
              src={organizacao}
              alt="Segmento de colégios"
              className="mb-4 h-14 w-14 transition-transform duration-300 group-hover:scale-110"
            />
            <h3 className="card-title text-lg font-semibold text-slate-900">Colégios</h3>
            <p className="text-sm leading-6 text-slate-700">
              Ideal para gestão completa de colégios e instituições de ensino básico.
            </p>
          </div>
        </article>

        <article className="card cursor-pointer bg-white text-center shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl group">
          <div className="card-body items-center">
            <img
              src={plano}
              alt="Segmento de ensino técnico"
              className="mb-4 h-14 w-14 transition-transform duration-300 group-hover:scale-110"
            />
            <h3 className="card-title text-lg font-semibold text-slate-900">Ensino Técnico</h3>
            <p className="text-sm leading-6 text-slate-700">
              Organização acadêmica e administrativa para cursos técnicos.
            </p>
          </div>
        </article>

        <article className="card cursor-pointer bg-white text-center shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl group">
          <div className="card-body items-center">
            <img
              src={universidade}
              alt="Segmento de universidades"
              className="mb-4 h-14 w-14 transition-transform duration-300 group-hover:scale-110"
            />
            <h3 className="card-title text-lg font-semibold text-slate-900">Universidades</h3>
            <p className="text-sm leading-6 text-slate-700">
              Solução completa para universidades e instituições de ensino superior.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
