const MILESTONES = [
  { year: "2002", title: "Fundação", text: "Elon Musk funda a Space Exploration Technologies Corp. (SpaceX), com a meta declarada de reduzir o custo do acesso ao espaço.", source: "https://www.spacex.com/" },
  { year: "2008", title: "Falcon 1 chega à órbita", text: "Após tentativas anteriores, o Falcon 1 se torna o primeiro foguete privado de propelente líquido a alcançar a órbita da Terra.", source: "https://www.nasa.gov/history/20-years-of-spacex/" },
  { year: "2012", title: "Dragon visita a estação espacial", text: "A Dragon completa a primeira missão de carga comercial a acoplar à Estação Espacial Internacional (ISS).", source: "https://www.nasa.gov/news-release/nasa-spacex-celebrate-successful-cargo-delivery-to-space-station/" },
  { year: "2015 · 2017", title: "Pouso e reutilização do Falcon 9", text: "O primeiro estágio do Falcon 9 pousa em 2015 e volta a voar em 2017. Recuperar e reutilizar o estágio passa a fazer parte das operações da empresa.", source: "https://www.nasa.gov/news-release/nasa-spacex-launch-first-reused-rocket-on-commercial-resupply-mission/" },
  { year: "2020", title: "Tripulação parte dos EUA", text: "A missão Demo-2 leva astronautas da NASA à ISS a bordo da Crew Dragon, em um voo tripulado operacional a partir dos Estados Unidos.", source: "https://www.nasa.gov/news-release/nasa-astronauts-launch-from-america-in-historic-test-flight/" },
  { year: "6 mar 2025", title: "Teste de voo 8 da Starship", text: "O teste ocorreu em 6 de março. A nave foi perdida durante o voo; o evento não deve ser apresentado como sucesso integral.", source: "https://www.faa.gov/newsroom/faa-closes-spacex-starship-flight-8-investigation" },
]

const APPLICATIONS = [
  { number: "01", title: "Lançar satélites", body: "Falcon 9 e Falcon Heavy colocam satélites e cargas em órbita. Satélites apoiam comunicação, observação da Terra, meteorologia e pesquisa científica.", tag: "FALCON 9 · FALCON HEAVY" },
  { number: "02", title: "Transportar pessoas e carga", body: "Dragon leva carga e tripulação à ISS e retorna experimentos e equipamentos à Terra. A estação apoia pesquisas em microgravidade.", tag: "DRAGON · ISS" },
  { number: "03", title: "Conectar lugares remotos", body: "A rede Starlink usa satélites em órbita baixa para oferecer acesso à internet em áreas com poucas opções de infraestrutura terrestre. Disponibilidade e desempenho variam por local e capacidade da rede.", tag: "STARLINK · TELECOMUNICAÇÕES" },
  { number: "04", title: "Apoiar atividades profissionais", body: "Conectividade via satélite pode apoiar equipes em navios, aeronaves, áreas rurais e locais de resposta a emergências, onde redes terrestres são limitadas.", tag: "USOS COTIDIANOS E PROFISSIONAIS" },
]

const SOURCES = [
  ["SpaceX — Falcon 9", "https://www.spacex.com/vehicles/falcon-9/"],
  ["SpaceX — Dragon", "https://www.spacex.com/vehicles/dragon/"],
  ["SpaceX — Starship", "https://www.spacex.com/vehicles/starship/"],
  ["SpaceX — Starlink", "https://www.starlink.com/"],
  ["NASA — história da SpaceX", "https://www.nasa.gov/history/20-years-of-spacex/"],
  ["NASA — Demo-2", "https://www.nasa.gov/news-release/nasa-astronauts-launch-from-america-in-historic-test-flight/"],
  ["FAA — investigação do voo 8 da Starship", "https://www.faa.gov/newsroom/faa-closes-spacex-starship-flight-8-investigation"],
  ["Blue Origin — New Glenn", "https://www.blueorigin.com/news/new-glenn-ng-2-mission"],
]

export function HistoryTimeline() {
  return <section id="marcos" className="py-24 md:py-32 bg-[#080a0d] border-y border-white/8">
    <div className="max-w-7xl mx-auto px-6">
      <p className="font-display text-[11px] tracking-[0.3em] uppercase text-[#4a9fff] mb-3">Trajetória · fatos selecionados</p>
      <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-5">Marcos da exploração</h2>
      <p className="font-body text-sm md:text-base text-white/50 max-w-2xl leading-relaxed mb-12">Uma linha do tempo curta para contextualizar a empresa e o setor. Cada item aponta para uma fonte de referência.</p>
      <ol className="grid md:grid-cols-2 gap-4">
        {MILESTONES.map((item, i) => <li key={item.year + item.title} className="relative border border-white/10 bg-black/45 p-6 md:p-7">
          <div className="flex items-baseline gap-4 mb-3"><span className="font-display text-3xl md:text-4xl font-800 text-[#4a9fff]">{item.year}</span><span className="h-px flex-1 bg-white/10" /><span className="font-display text-[10px] tracking-[0.2em] text-white/30">MARCO {String(i + 1).padStart(2, "0")}</span></div>
          <h3 className="font-display text-xl md:text-2xl font-700 uppercase mb-2">{item.title}</h3>
          <p className="font-body text-sm text-white/55 leading-relaxed mb-4">{item.text}</p>
          <a href={item.source} target="_blank" rel="noreferrer" className="font-display text-[10px] uppercase tracking-[0.15em] text-[#75b8ff] hover:text-white focus-visible:outline-2 focus-visible:outline-white">Fonte ↗</a>
        </li>)}
      </ol>
      <p className="font-body text-xs text-white/35 mt-7">As datas descrevem eventos passados; previsões de lançamento não são apresentadas como fatos.</p>
    </div>
  </section>
}

export function ApplicationsSection() {
  return <section id="aplicacoes" className="py-24 md:py-32">
    <div className="max-w-7xl mx-auto px-6">
      <p className="font-display text-[11px] tracking-[0.3em] uppercase text-[#4a9fff] mb-3">Tecnologias e serviços</p>
      <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-5">Do espaço ao cotidiano</h2>
      <p className="font-body text-sm md:text-base text-white/50 max-w-2xl leading-relaxed mb-12">Foguetes, espaçonaves e telecomunicações atendem necessidades diferentes. Satélites e lançamentos também sustentam atividades de outras organizações.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {APPLICATIONS.map((item) => <article key={item.number} className="group border border-white/10 bg-[#080a0d] p-6 md:p-8 transition-colors hover:border-[#4a9fff]/50">
          <div className="flex justify-between items-start mb-8"><span className="font-display text-sm text-[#4a9fff]">{item.number}</span><span className="font-display text-[9px] tracking-[0.16em] text-white/35 text-right">{item.tag}</span></div>
          <h3 className="font-display text-2xl md:text-3xl font-700 uppercase mb-3">{item.title}</h3>
          <p className="font-body text-sm text-white/55 leading-relaxed">{item.body}</p>
        </article>)}
      </div>
    </div>
  </section>
}

export function ImpactSection() {
  return <section id="impactos" className="py-24 md:py-32 bg-[#080a0d] border-y border-white/8">
    <div className="max-w-7xl mx-auto px-6">
      <p className="font-display text-[11px] tracking-[0.3em] uppercase text-[#4a9fff] mb-3">Contribuições e limites</p>
      <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-12">O que a tecnologia resolve — e o que exige</h2>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <div><h3 className="font-display text-2xl font-700 uppercase mb-5">Possibilidades</h3><ul className="space-y-4 text-sm text-white/60 leading-relaxed">
          <li><span className="text-[#4a9fff] mr-2">↗</span>Reutilizar um estágio pode reduzir o material descartado por voo e ajudar a ampliar a frequência de lançamentos; o resultado depende do custo de recuperação, manutenção e operação.</li>
          <li><span className="text-[#4a9fff] mr-2">↗</span>Satélites e conectividade podem apoiar comunicação, pesquisa, monitoramento ambiental e resposta a emergências.</li>
          <li><span className="text-[#4a9fff] mr-2">↗</span>Missões tripuladas e de carga viabilizam pesquisa e operações na estação espacial.</li>
        </ul></div>
        <div><h3 className="font-display text-2xl font-700 uppercase mb-5">Desafios</h3><ul className="space-y-4 text-sm text-white/60 leading-relaxed">
          <li><span className="text-amber-300 mr-2">!</span>Construir, lançar e manter infraestrutura espacial exige grande investimento e acesso ao solo, energia, espectro de rádio e locais de lançamento.</li>
          <li><span className="text-amber-300 mr-2">!</span>Mais objetos em órbita aumentam a necessidade de rastrear detritos e evitar colisões; satélites precisam ser retirados de órbita com segurança ao fim da vida útil.</li>
          <li><span className="text-amber-300 mr-2">!</span>Internet por satélite depende de equipamento, cobertura e capacidade local; não substitui redes terrestres em todos os cenários.</li>
          <li><span className="text-amber-300 mr-2">!</span>Lançamentos têm riscos técnicos e impactos ambientais, sonoros e sobre comunidades próximas. A reutilização não elimina esses desafios.</li>
        </ul></div>
      </div>
    </div>
  </section>
}

export function SourcesSection() {
  return <section id="fontes" className="py-20 border-t border-white/8">
    <div className="max-w-7xl mx-auto px-6">
      <p className="font-display text-[11px] tracking-[0.3em] uppercase text-[#4a9fff] mb-3">Leitura e checagem</p>
      <h2 className="font-display text-3xl md:text-5xl font-800 uppercase tracking-tight mb-8">Fontes de consulta</h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOURCES.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer" className="block h-full border border-white/10 p-4 font-body text-sm text-white/55 hover:text-white hover:border-[#4a9fff]/50 transition-colors focus-visible:outline-2 focus-visible:outline-white">{label} <span aria-hidden="true">↗</span></a></li>)}
      </ul>
      <p className="font-body text-xs text-white/35 mt-5">Fontes institucionais para os marcos e descrições. Consulta editorial: 22 de outubro de 2026. Os números de lançamento em tempo real foram retirados para evitar previsões desatualizadas.</p>
    </div>
  </section>
}
