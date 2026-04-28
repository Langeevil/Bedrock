export default function Collapse() {
  return (
    <>
      <div className="collapse collapse-arrow rounded-lg border border-gray-200 bg-white">
        <input type="radio" name="container-collapse" defaultChecked={true} />
        <div className="collapse-title px-6 py-4 text-lg font-medium text-slate-900 md:text-xl">
          Como funciona a centralização de aulas e tarefas?
        </div>
        <div className="collapse-content px-6 pb-6 text-sm text-slate-700 md:text-base">
          Você cadastra turmas, aulas e tarefas e tudo aparece em um painel único
          com prazos, anexos e anotações, facilitando o acompanhamento do seu
          cronograma.
        </div>
      </div>

      <div className="collapse collapse-arrow rounded-lg border border-gray-200 bg-white">
        <input type="radio" name="container-collapse" defaultChecked={false} />
        <div className="collapse-title px-6 py-4 text-lg font-medium text-slate-900 md:text-xl">
          O sistema sincroniza com calendários externos?
        </div>
        <div className="collapse-content px-6 pb-6 text-sm text-slate-700 md:text-base">
          Sim. Oferecemos integração com calendários padrão por exportação e
          assinatura. Em breve teremos sincronização automática com Google Calendar
          e outros serviços.
        </div>
      </div>

      <div className="collapse collapse-arrow rounded-lg border border-gray-200 bg-white">
        <input type="radio" name="container-collapse" defaultChecked={false} />
        <div className="collapse-title px-6 py-4 text-lg font-medium text-slate-900 md:text-xl">
          Posso usar em dispositivos móveis?
        </div>
        <div className="collapse-content px-6 pb-6 text-sm text-slate-700 md:text-base">
          Sim. O componente é responsivo: margens e tipografia se adaptam em
          diferentes tamanhos de tela, garantindo boa leitura e toque confortável
          em dispositivos menores.
        </div>
      </div>
    </>
  );
}
