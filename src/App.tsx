import { lazy, Suspense, useCallback, useEffect, useState } from "react"
import BackgroundMedia from "./BackgroundMedia"
import DetailModal, { type ModalState } from "./DetailModal"
import { ApplicationsSection, HistoryTimeline, ImpactSection, SourcesSection } from "./EducationalSections"
import { useLaunches } from "./useLaunches"
import { canCountDown, countdownAt, launchStatus, missionFromLaunch, orderLaunches } from "./launches"

const LandingGame = lazy(() => import("./LandingGame"))
const NAV_LINKS = [
  { label: "Veículos", id: "veiculos" },
  { label: "Lançamentos", id: "lancamentos" },
  { label: "História", id: "marcos" },
  { label: "Aplicações", id: "aplicacoes" },
  { label: "Simulador", id: "jogo" },
]
const VEHICLES = [
  {
    name: "Falcon 9", type: "Foguete orbital reutilizável", id: "falcon-9",
    desc: "Levar à órbita. Voltar para voar de novo. O primeiro estágio do Falcon 9 retorna à Terra e pode ser reutilizado em outras missões.",
    img: "/images/scenes/falcon.webp", mobileImg: "/images/scenes/falcon-mobile.webp",
    alt: "Falcon 9 decolando com a espaçonave Dragon na missão Crew-9",
    detailImg: "/images/scenes/landing.webp", detailAlt: "Falcon Heavy pousando seus propulsores laterais", detailCredit: "SpaceX · Falcon Heavy", detailPosition: "center",
    credit: "SpaceX · Crew-9", source: "https://www.spacex.com/vehicles/falcon-9/",
    position: "center", alignment: "left",
  },
  {
    name: "Starship", type: "Um sistema em desenvolvimento", id: "starship",
    desc: "A nave Starship e o propulsor Super Heavy foram projetados para ser reutilizados. O objetivo: transportar pessoas e cargas à órbita, à Lua e a Marte.",
    img: "/images/scenes/starship.webp", mobileImg: "/images/scenes/starship-mobile.webp",
    alt: "Propulsor Super Heavy retornando aos braços da torre de lançamento",
    detailImg: "/images/scenes/starship.webp", detailAlt: "Propulsor Super Heavy sendo capturado pela torre", detailCredit: "SpaceX · Starship", detailPosition: "center",
    credit: "SpaceX · Super Heavy", source: "https://www.spacex.com/vehicles/starship/",
    position: "center", alignment: "right",
  },
  {
    name: "Dragon", type: "Pessoas e ciência em órbita", id: "dragon",
    desc: "Uma ponte entre a Terra e a estação espacial. A Dragon transporta astronautas e cargas à ISS e traz experimentos de volta para casa.",
    img: "/images/scenes/crew.webp", mobileImg: "/images/scenes/crew-mobile.webp",
    detailImg: "/images/crew-dragon-endeavour.jpg", detailAlt: "Espaçonave Crew Dragon Endeavour em órbita sobre a Terra", detailCredit: "NASA · Crew Dragon Endeavour", detailPosition: "center 42%",
    alt: "Astronauta com traje espacial e capacete dentro da espaçonave Dragon",
    credit: "SpaceX · voos tripulados", source: "https://www.spacex.com/vehicles/dragon/",
    position: "center", alignment: "right",
  },
]

function LaunchCountdown({ launchAt, now }: { launchAt: Date; now: number }) {
  const time = countdownAt(launchAt.getTime(), now)
  return <div className="hero-countdown">{[[time.days, "dias"], [time.hours, "horas"], [time.minutes, "min"], [time.seconds, "seg"]].map(([n, label], index) => <div className="countdown-unit" key={label}><strong>{String(n).padStart(2, "0")}</strong><span>{label}</span>{index < 3 && <i aria-hidden="true">:</i>}</div>)}</div>
}
function CompactCountdown({ launchAt, now }: { launchAt: Date; now: number }) {
  const time = countdownAt(launchAt.getTime(), now)
  return <span className="compact-countdown">{time.days}d {String(time.hours).padStart(2, "0")}h {String(time.minutes).padStart(2, "0")}m</span>
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const { snapshot, loading, error, now, stale } = useLaunches()
  const launches = orderLaunches(snapshot?.launches ?? [], now).map(launch => missionFromLaunch(launch, now))
  const nextLaunch = launches.find(launch => canCountDown(launch, now))
  const stats = snapshot?.stats ?? { totalLaunches: 395, totalLandings: 353, totalReflights: 312 }
  const closeModal = useCallback(() => setModal(null), [])

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
    if (!('IntersectionObserver' in window)) { targets.forEach(target => target.classList.add('is-visible')); return }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' })
    targets.forEach(target => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return <div className="site-shell">
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <header className={`site-header ${scrolled || menuOpen ? "is-solid" : ""}`}>
      <a className="site-wordmark" href="#inicio" onClick={() => setMenuOpen(false)} aria-label="SpaceX — início">SpaceX</a>
      <nav className="desktop-nav" aria-label="Navegação principal">
        {NAV_LINKS.map(link => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(value => !value)}>
        <span className={menuOpen ? "menu-line is-open" : "menu-line"} />
        <span className={menuOpen ? "menu-line is-open" : "menu-line"} />
      </button>
      <nav id="mobile-menu" className="mobile-nav" aria-label="Navegação móvel" hidden={!menuOpen}>
        {[...NAV_LINKS, { label: "Impactos", id: "impactos" }, { label: "Fontes", id: "fontes" }].map(link => <a key={link.id} href={`#${link.id}`} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
      </nav>
    </header>

    <main id="conteudo">
      <section id="inicio" className="scene scene-hero" aria-labelledby="hero-heading">
        <BackgroundMedia image="/images/scenes/landing.webp" imageMobile="/images/scenes/landing-mobile.webp"
          video="https://sxcontent9668.azureedge.us/cms-assets/assets/Space_X_Falcon_Heavy_UAS_Landing_DESKTOP_compress_b4568daf9c_5e2026727a.mp4"
          alt="Os dois propulsores laterais do Falcon Heavy retornam às plataformas de pouso"
          credit="SpaceX · Falcon Heavy" priority />
        <div className="scene-inner">
          <div className="scene-copy hero-copy reveal is-visible">
            <h1 id="hero-heading">Além da<br />Terra.</h1>
            <p>Conheça os veículos e as ideias que estão transformando o acesso ao espaço.</p>
            <a href="#veiculos" className="outline-button">Explorar veículos</a>
            <div className="hero-launch"><p className="eyebrow">Próximo lançamento — {nextLaunch?.name ?? "SpaceX"}</p>
              {nextLaunch?.launchAt ? <LaunchCountdown launchAt={nextLaunch.launchAt} now={now} /> : <p className="hero-launch-pending">{loading ? "Buscando programação atualizada" : error || stale ? "Atualização pendente · consulte as fontes oficiais" : "Data e horário a confirmar"}</p>}
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#estatisticas"><span>Rolar</span><i /></a>
        <span className="project-note">Projeto educacional independente</span>
      </section>

      <section id="estatisticas" className="stats-strip" aria-label="Estatísticas de voos SpaceX">
        <div className="stats-inner">
          {[[stats.totalLaunches, "Total de lançamentos"], [stats.totalLandings, "Pousos bem-sucedidos"], [stats.totalReflights, "Reutilizações"], [99.5, "Sucesso das missões", "%"]].map(([value, label, suffix], index) => <div className="stat-item reveal" key={label} style={{ transitionDelay: `${index * 90}ms` }}><strong>{Number(value).toLocaleString("pt-BR")}{suffix ?? ""}</strong><span>{label}</span></div>)}
        </div>
        <p className="stats-source">Estatísticas oficiais de Falcon 9 + Dragon · <a href="https://www.spacex.com/vehicles/falcon-9/" target="_blank" rel="noreferrer">fonte SpaceX</a></p>
      </section>

      <div id="veiculos" aria-label="Veículos SpaceX">
        {VEHICLES.map((vehicle, index) => <section id={vehicle.id} key={vehicle.id}
          className={`scene scene-vehicle scene-${vehicle.id} ${vehicle.alignment === "right" ? "scene-right" : ""}`}
          aria-labelledby={`${vehicle.id}-heading`}>
          <BackgroundMedia image={vehicle.img} imageMobile={vehicle.mobileImg} alt={vehicle.alt}
            credit={vehicle.credit} position={vehicle.position} />
          <div className="scene-inner">
            <div className="scene-copy reveal">
              <h2 id={`${vehicle.id}-heading`}>{vehicle.name}</h2>
              <p>{vehicle.desc}</p>
              <button className="outline-button" onClick={() => setModal({ kind: "vehicle", index })}>Conhecer {vehicle.name}</button>
            </div>
          </div>
        </section>)}
      </div>

      <section id="lancamentos" className="launches-section"><BackgroundMedia image="/images/scenes/landing.webp" imageMobile="/images/scenes/landing-mobile.webp" alt="Foguete Falcon 9 da SpaceX na plataforma de lançamento" credit="Imagens · SpaceX" position="center" /><div className="launches-shade" /><div className="launches-content"><div className="launches-heading"><div className="reveal"><p className="eyebrow">Registro de missões</p><h2>Lançamentos</h2></div><a className="more-launches" href="https://www.spacex.com/launches/" target="_blank" rel="noreferrer">Ver mais lançamentos ↗</a></div>
        <div className="launch-meta reveal"><p>Dados de <a href="https://thespacedevs.com/llapi" target="_blank" rel="noreferrer">The Space Devs · Launch Library 2</a>. Horários de Brasília.</p><p>{loading ? "Atualizando a cada 30 minutos…" : error || stale ? "Atualização indisponível; consulte os dados oficiais antes do lançamento." : "Atualização programada a cada 30 minutos; datas sujeitas a alteração."}</p>{snapshot && <p>Última consulta: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(snapshot.fetchedAt))}.</p>}</div>
        <div className="launch-list">{launches.length ? launches.slice(0, 6).map((launch, index) => <div className="launch-row reveal" key={launch.id} style={{ transitionDelay: `${Math.min(index, 5) * 65}ms` }}><span className="launch-date">{launch.launchAt && launch.launchAt.getTime() <= now ? "Aguardando atualização" : launch.date}</span><div className="launch-name"><strong>{launch.name}</strong></div><span className="launch-vehicle">{launch.vehicle}</span><span className="launch-status">{launch.countdown ? <CompactCountdown launchAt={launch.launchAt!} now={now} /> : launchStatus(launch, now)}</span><span className="launch-location">{launch.location}</span></div>) : <p className="launch-empty">{loading ? "Carregando agenda de lançamentos…" : "Não foi possível obter a agenda agora."} <a href="https://www.spacex.com/launches/" target="_blank" rel="noreferrer">Calendário oficial SpaceX ↗</a></p>}</div>
        <p className="launch-disclaimer">Previsões da Launch Library 2; horários em Brasília. Os dados podem mudar.</p></div>
      </section>

      <div className="reveal"><HistoryTimeline /></div>
      <div className="reveal"><ApplicationsSection /></div>
      <div className="reveal"><ImpactSection /></div>

      <section id="jogo" className="reading-section simulation-section" aria-labelledby="game-heading">
        <div className="reading-width">
          <div className="section-intro reveal">
            <h2 id="game-heading">O desafio<br />de voltar.</h2>
            <div>
              <p>Chegar ao espaço é só uma parte da missão. Experimente controlar a inclinação e o impulso de um foguete até pousar na plataforma.</p>
              <button className="outline-button" aria-expanded={gameOpen} aria-controls="landing-simulator" onClick={() => setGameOpen(open => !open)}>{gameOpen ? "Fechar simulador" : "Experimentar o pouso"}</button>
            </div>
          </div>
          {gameOpen && <div id="landing-simulator" className="simulator-panel">
            <Suspense fallback={<p role="status">Carregando simulador…</p>}><LandingGame /></Suspense>
            <p className="small-note">Simulação didática simplificada. A física e os controles de um voo real são mais complexos.</p>
          </div>}
        </div>
      </section>

      <div className="reveal"><SourcesSection /></div>
    </main>

    <footer className="site-footer" id="sobre">
      <div className="footer-row">
        <a href="#inicio" className="site-wordmark">SpaceX</a>
        <div className="footer-links"><a href="#marcos">História</a><a href="#fontes">Fontes</a><a href="#inicio">Voltar ao início</a></div>
      </div>
      <p>Projeto educacional independente do Tech CAMPS, sem vínculo com a SpaceX. Fotografias e vídeo: SpaceX. Marcas e mídias pertencem aos respectivos titulares.</p>
      <details className="project-details"><summary>Sobre o projeto</summary>
        <p>Pesquisa estudantil sobre a trajetória da SpaceX, suas tecnologias, aplicações e impactos. A empresa foi fundada em 2002 por Elon Musk, com objetivos que incluem ampliar o acesso ao espaço e desenvolver sistemas para missões à Lua e a Marte.</p>
        <p>A reutilização também avança em outras empresas: em novembro de 2025, a Blue Origin pousou o primeiro estágio do New Glenn. Conheça as fontes institucionais usadas nesta pesquisa na seção de referências.</p>
      </details>
    </footer>
    <DetailModal state={modal} vehicles={VEHICLES} onClose={closeModal} />
  </div>
}
