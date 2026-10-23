import { lazy, Suspense, useCallback, useEffect, useState } from "react"
import BackgroundMedia from "./BackgroundMedia"
import DetailModal, { type ModalState } from "./DetailModal"
import { ApplicationsSection, HistoryTimeline, ImpactSection, SourcesSection } from "./EducationalSections"

const LandingGame = lazy(() => import("./LandingGame"))
const NAV_LINKS = [
  { label: "Veículos", id: "veiculos" },
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
    credit: "SpaceX · Crew-9", source: "https://www.spacex.com/vehicles/falcon-9/",
    position: "center", alignment: "left",
  },
  {
    name: "Starship", type: "Um sistema em desenvolvimento", id: "starship",
    desc: "A nave Starship e o propulsor Super Heavy foram projetados para ser reutilizados. O objetivo: transportar pessoas e cargas à órbita, à Lua e a Marte.",
    img: "/images/scenes/starship.webp", mobileImg: "/images/scenes/starship-mobile.webp",
    alt: "Propulsor Super Heavy retornando aos braços da torre de lançamento",
    credit: "SpaceX · Super Heavy", source: "https://www.spacex.com/vehicles/starship/",
    position: "center", alignment: "right",
  },
  {
    name: "Dragon", type: "Pessoas e ciência em órbita", id: "dragon",
    desc: "Uma ponte entre a Terra e a estação espacial. A Dragon transporta astronautas e cargas à ISS e traz experimentos de volta para casa.",
    img: "/images/scenes/crew.webp", mobileImg: "/images/scenes/crew-mobile.webp",
    detailImg: "/images/scenes/dragon.webp", detailAlt: "Dragon durante a aproximação à ISS na missão Crew-6", detailCredit: "SpaceX · Crew-6",
    alt: "Astronauta com traje espacial e capacete dentro da espaçonave Dragon",
    credit: "SpaceX · voos tripulados", source: "https://www.spacex.com/vehicles/dragon/",
    position: "center", alignment: "right",
  },
]

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
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
          <div className="scene-copy hero-copy">
            <h1 id="hero-heading">Além da<br />Terra.</h1>
            <p>Conheça os veículos e as ideias que estão transformando o acesso ao espaço.</p>
            <a href="#veiculos" className="outline-button">Explorar veículos</a>
          </div>
        </div>
        <span className="project-note">Projeto educacional independente</span>
      </section>

      <div id="veiculos" aria-label="Veículos SpaceX">
        {VEHICLES.map((vehicle, index) => <section id={vehicle.id} key={vehicle.id}
          className={`scene scene-vehicle scene-${vehicle.id} ${vehicle.alignment === "right" ? "scene-right" : ""}`}
          aria-labelledby={`${vehicle.id}-heading`}>
          <BackgroundMedia image={vehicle.img} imageMobile={vehicle.mobileImg} alt={vehicle.alt}
            credit={vehicle.credit} position={vehicle.position} />
          <div className="scene-inner">
            <div className="scene-copy">
              <h2 id={`${vehicle.id}-heading`}>{vehicle.name}</h2>
              <p>{vehicle.desc}</p>
              <button className="outline-button" onClick={() => setModal({ kind: "vehicle", index })}>Conhecer {vehicle.name}</button>
            </div>
          </div>
        </section>)}
      </div>

      <HistoryTimeline />
      <ApplicationsSection />
      <ImpactSection />

      <section id="jogo" className="reading-section simulation-section" aria-labelledby="game-heading">
        <div className="reading-width">
          <div className="section-intro">
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

      <SourcesSection />
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
