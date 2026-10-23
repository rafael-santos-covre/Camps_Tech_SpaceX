import AnimatedDetails from "./AnimatedDetails"

const MILESTONES = [
  { year: "2002", title: "Fundação", text: "Elon Musk funda a Space Exploration Technologies Corp. (SpaceX), com a meta declarada de reduzir o custo do acesso ao espaço.", source: "https://ir.spacex.com/faqs-and-contact/" },
  { year: "2008", title: "Falcon 1 chega à órbita", text: "Após tentativas anteriores, o Falcon 1 se torna o primeiro foguete privado de propelente líquido a alcançar a órbita da Terra.", source: "https://www.nasa.gov/wp-content/uploads/2018/07/spacex_nasa_crs-7_presskit.pdf" },
  { year: "2012", title: "Dragon visita a estação espacial", text: "A Dragon completa a primeira missão de carga comercial a acoplar à Estação Espacial Internacional (ISS).", source: "https://www.nasa.gov/image-article/dragon-approaches-station/" },
  { year: "2015 · 2017", title: "Pouso e reutilização do Falcon 9", text: "O primeiro estágio do Falcon 9 pousa em 2015 e volta a voar em 2017. Recuperar e reutilizar o estágio passa a fazer parte das operações da empresa.", source: "https://www.spacex.com/mission/" },
  { year: "2020", title: "Tripulação parte dos EUA", text: "A missão Demo-2 leva astronautas da NASA à ISS a bordo da Crew Dragon, em um voo de teste tripulado a partir dos Estados Unidos.", source: "https://www.nasa.gov/news-release/nasa-astronauts-launch-from-america-in-historic-test-flight-of-spacex-crew-dragon/" },
  { year: "6 mar 2025", title: "Teste de voo 8 da Starship", text: "A nave foi perdida durante o voo de teste de 6 de março, evidenciando os riscos técnicos de um sistema ainda em desenvolvimento.", source: "https://www.faa.gov/newsroom/statements/general-statements#Mishap" },
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
  ["SpaceX — fundação da empresa", "https://ir.spacex.com/faqs-and-contact/"],
  ["NASA — marcos iniciais da SpaceX", "https://www.nasa.gov/wp-content/uploads/2018/07/spacex_nasa_crs-7_presskit.pdf"],
  ["NASA — Demo-2", "https://www.nasa.gov/news-release/nasa-astronauts-launch-from-america-in-historic-test-flight-of-spacex-crew-dragon/"],
  ["FAA — investigação do voo 8 da Starship", "https://www.faa.gov/newsroom/statements/general-statements#Mishap"],
  ["Blue Origin — missão NG-2", "https://www.blueorigin.com/missions/ng-2"],
]

export function HistoryTimeline() {
  return <section id="marcos" className="reading-section" aria-labelledby="history-heading">
    <div className="reading-width history-layout">
      <div className="section-heading reveal">
        <h2 id="history-heading">Uma nova<br />trajetória.</h2>
        <p>Da fundação em 2002 aos testes de novos veículos. Seis momentos para entender como a empresa chegou até aqui.</p>
      </div>
      <div className="timeline">
        {MILESTONES.map((item, index) => <AnimatedDetails key={item.year} className="timeline-item reveal" style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }} summary={<><span className="timeline-year">{item.year}</span><span>{item.title}</span></>}>
          <div className="timeline-copy"><p>{item.text}</p><a href={item.source} target="_blank" rel="noreferrer">Consultar fonte</a></div>
        </AnimatedDetails>)}
      </div>
    </div>
  </section>
}

export function ApplicationsSection() {
  return <section id="aplicacoes" className="reading-section" aria-labelledby="applications-heading">
    <div className="reading-width">
      <div className="section-intro reveal">
        <h2 id="applications-heading">O espaço faz<br />parte da vida.</h2>
        <p>Comunicação, pesquisa e conexões onde a infraestrutura terrestre não chega. A tecnologia espacial já está presente no cotidiano.</p>
      </div>
      <div className="applications-list">
        {APPLICATIONS.map((item, index) => <article className="reveal" style={{ transitionDelay: `${index * 80}ms` }} key={item.number}><h3>{item.title}</h3><p>{item.body}</p></article>)}
      </div>
    </div>
  </section>
}

export function ImpactSection() {
  return <section id="impactos" className="reading-section impact-section" aria-labelledby="impact-heading">
    <div className="reading-width section-intro">
      <div className="section-heading reveal"><h2 id="impact-heading">Avançar também<br />é avaliar.</h2><p>Novas possibilidades trazem responsabilidades. Conheça os benefícios e os limites dessas tecnologias.</p></div>
      <div className="impact-disclosures">
        <AnimatedDetails className="plain-disclosure" summary="Possibilidades">
          <ul>
            <li>Reutilizar estágios pode reduzir o material descartado por voo e ampliar a frequência de lançamentos. O resultado depende dos custos de recuperação, manutenção e operação.</li>
            <li>Satélites apoiam comunicação, pesquisa, monitoramento ambiental e resposta a emergências.</li>
            <li>Missões tripuladas e de carga viabilizam pesquisa e operações na estação espacial.</li>
          </ul>
        </AnimatedDetails>
        <AnimatedDetails className="plain-disclosure" summary="Desafios">
          <ul>
            <li>A infraestrutura espacial exige investimento, energia, espectro de rádio e locais de lançamento.</li>
            <li>Mais objetos em órbita exigem rastreamento de detritos, prevenção de colisões e retirada segura de satélites ao fim da vida útil.</li>
            <li>A internet por satélite depende de equipamentos, cobertura e capacidade local. Não substitui redes terrestres em todos os cenários.</li>
            <li>Lançamentos têm riscos técnicos e impactos ambientais, sonoros e sobre comunidades próximas. A reutilização não elimina esses desafios.</li>
          </ul>
        </AnimatedDetails>
      </div>
    </div>
  </section>
}

export function SourcesSection() {
  return <section id="fontes" className="sources-section">
    <div className="reading-width">
      <AnimatedDetails className="plain-disclosure sources-disclosure" summary="Fontes e referências">
        <ul className="sources-list">{SOURCES.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer">{label}<span aria-hidden="true">↗</span></a></li>)}</ul>
        <p className="small-note">Fotografias e vídeo disponibilizados pela SpaceX. Informações consultadas em outubro de 2026.</p>
      </AnimatedDetails>
    </div>
  </section>
}
