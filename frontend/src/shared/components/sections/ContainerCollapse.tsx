import Collapse from "../Collapse";

export default function ContainerCollapse() {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:px-12 lg:px-24">
      <h2 className="mb-8 text-center text-3xl font-semibold text-slate-950 md:text-4xl">
        Perguntas Frequentes
      </h2>

      <div className="mx-auto w-full space-y-6 md:space-y-8">
        <Collapse />
      </div>
    </section>
  );
}
