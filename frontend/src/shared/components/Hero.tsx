import React from "react";
import estudanteFlutuando from "../../assets/estudante_flutuando_longe.gif";

const Hero: React.FC = () => {
  return (
    <section
      id="about"
      className="w-full bg-[#18396F] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 md:pt-32 lg:px-8"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-screen-xl flex-col items-center justify-between gap-10 md:flex-row md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-poppins text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            Sistema com controle <br />
            e eficiência para <br />
            instituição acadêmica
          </h1>

          <p className="mt-6 max-w-2xl font-poppins text-base text-white/90 sm:text-lg md:text-xl">
            Conectando alunos, professores e a administração para um aprendizado de
            excelência. O futuro da gestão educacional, construído em colaboração.
          </p>

          <button className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-3xl bg-white px-8 py-3 text-base font-medium text-black shadow-md transition-transform hover:scale-105">
            Comece agora
          </button>
        </div>

        <div className="flex flex-1 justify-center">
          <img
            src={estudanteFlutuando}
            alt="Gestão acadêmica animada"
            className="w-full max-w-[18rem] object-contain sm:max-w-sm md:max-w-md lg:max-w-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
