import { useState, useEffect, useRef, useCallback } from "react"
import BackgroundMedia from "./BackgroundMedia"
import LandingGame from "./LandingGame"
import DetailModal, { type ModalState } from "./DetailModal"
import { ApplicationsSection, HistoryTimeline, ImpactSection, SourcesSection } from "./EducationalSections"

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(
  options?: IntersectionObserverInit,
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "História", id: "marcos" },
  { label: "Veículos", id: "veiculos" },
  { label: "Aplicações", id: "aplicacoes" },
  { label: "Impactos", id: "impactos" },
  { label: "Projeto", id: "sobre" },
  { label: "Simulador", id: "jogo" },
]

const VEHICLES = [
  {
    name: "Falcon 9",
    type: "Foguete Orbital",
    desc: "Foguete orbital de dois estágios. Seu primeiro estágio pode pousar e voltar a voar em outras missões.",
    stat: "Reutilizável",
    statLabel: "1º estágio pode pousar e voar novamente",
    img: "./images/falcon-9-demo-2.jpg",
    alt: "Falcon 9 da SpaceX decolando com a Crew Dragon durante a missão Demo-2 da NASA",
    credit: "Falcon 9 · missão Demo-2 · NASA / Joel Kowsky",
  },
  {
    name: "Starship",
    type: "Próxima Geração",
    desc: "Sistema de transporte totalmente reutilizável projetado para levar tripulação e carga à órbita da Terra, à Lua, a Marte e além.",
    stat: "Em teste",
    statLabel: "Sistema de dois estágios reutilizáveis em desenvolvimento",
    img: "./images/starship-illustration.svg",
    alt: "Ilustração técnica da Starship e do propulsor Super Heavy",
    credit: "Ilustração educacional · Tech CAMPS",
  },
  {
    name: "Dragon",
    type: "Espaçonave",
    desc: "Espaçonave reutilizável que transporta carga e tripulação e pode acoplar à Estação Espacial Internacional.",
    stat: "ISS",
    statLabel: "Carga e tripulação em órbita baixa",
    img: "./images/crew-dragon-endeavour.jpg",
    alt: "Crew Dragon Endeavour se aproximando da Estação Espacial Internacional acima da Terra durante a Crew-8",
    credit: "Crew-8 · NASA",
  },
]

const PROJECT_FACTS = [
  { label: "Fundação", value: "2002", detail: "SpaceX criada por Elon Musk" },
  { label: "Reutilização", value: "Falcon 9", detail: "O primeiro estágio retorna para pousar" },
  { label: "Conectividade", value: "Starlink", detail: "Internet por uma rede de satélites" },
  { label: "Transporte", value: "Dragon", detail: "Carga e pessoas rumo à estação espacial" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeVehicle, setActiveVehicle] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)
  const closeModal = useCallback(() => setModal(null), [])
  const openVehicle = (name: string) => {
    const index = VEHICLES.findIndex((v) => v.name === name)
    if (index >= 0) setModal({ kind: "vehicle", index })
  }
  const [factsRef, factsInView] = useInView({ threshold: 0.2 })
  const [aboutRef, aboutInView] = useInView({ threshold: 0.2 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/8"
            : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2" aria-label="Tech CAMPS — início">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L3 28h26L16 2z"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M16 2L16 28"
                stroke="white"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle cx="16" cy="16" r="3" fill="white" />
            </svg>
            <span className="font-display text-xl font-700 tracking-[0.15em] uppercase">
              TECH CAMPS
            </span>
          </a>

          <ul className="hidden xl:flex items-center gap-4 2xl:gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="font-display text-[13px] font-500 tracking-[0.12em] uppercase text-white/70 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
          <button
              onClick={() => document.getElementById("marcos")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden xl:inline-flex items-center gap-2 font-display text-[12px] font-600 tracking-[0.15em] uppercase px-5 py-2.5 border border-white/30 hover:border-white hover:bg-white hover:text-black transition-all duration-300"
            >
                Explorar marcos
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden flex flex-col gap-1.5 p-2 focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span
                className={`block w-6 h-px bg-white transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-px bg-white transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`xl:hidden overflow-y-auto transition-all duration-300 ${
            menuOpen ? "max-h-[calc(100svh-4rem)] border-t border-white/8" : "max-h-0 overflow-hidden"
          }`}
        >
          <div className="bg-black px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
                className="font-display text-sm font-500 tracking-[0.12em] uppercase text-white/70 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
          id="inicio"
        className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
      >
        <BackgroundMedia
          image="https://sxcontent9668.azureedge.us/cms-assets/assets/Leading_Launch_Service_Desktop_06a98ac534.jpg"
          fallback="./images/falcon-9-demo-2.jpg"
          video="https://sxcontent9668.azureedge.us/cms-assets/assets/Space_X_Falcon_Heavy_UAS_Landing_DESKTOP_compress_b4568daf9c_5e2026727a.mp4"
          alt="Propulsores do Falcon Heavy retornando para pouso"
          credit="IMAGENS · SPACEX"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24 md:pt-32 md:pb-28 w-full">
          <p
            className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-4"
            style={{ animation: "fadeUp 0.8s ease forwards 0.3s", opacity: 0 }}
          >
            PROJETO ESTUDANTIL · TECNOLOGIA ESPACIAL
          </p>
          <h1
            className="font-display text-[clamp(3.1rem,12vw,4.5rem)] md:text-[120px] font-800 leading-none tracking-tight uppercase mb-6 max-w-4xl"
            style={{ animation: "fadeUp 0.9s ease forwards 0.5s", opacity: 0 }}
          >
            A Humanidade
            <br />
            Além da
            <br />
            Terra
          </h1>
          <p
            className="font-body text-white/60 text-base md:text-lg max-w-md mb-10 leading-relaxed"
            style={{ animation: "fadeUp 0.9s ease forwards 0.75s", opacity: 0 }}
          >
            Um panorama educativo sobre os veículos, serviços, avanços e desafios
            da SpaceX, preparado pelo grupo Tech CAMPS.
          </p>
          <div
            className="flex flex-wrap gap-4"
            style={{ animation: "fadeUp 0.9s ease forwards 0.95s", opacity: 0 }}
          >
            <a
              href="#veiculos"
              className="inline-flex items-center gap-3 font-display text-[13px] font-600 tracking-[0.15em] uppercase bg-white text-black px-8 py-4 hover:bg-white/90 transition-colors duration-200"
            >
              Explorar Veículos
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#aplicacoes"
              className="inline-flex items-center gap-3 font-display text-[13px] font-600 tracking-[0.15em] uppercase border border-white/30 text-white px-8 py-4 hover:border-white transition-colors duration-200"
            >
              Como a tecnologia é usada
            </a>
          </div>

          <p className="relative z-10 mt-8 text-xs text-white/55">Projeto educacional independente, sem vínculo oficial com a SpaceX.</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-display text-[10px] tracking-[0.2em] uppercase text-white/30">
            Rolar
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4l4 4 4-4"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <div ref={factsRef} className="border-y border-white/8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {PROJECT_FACTS.map((fact, i) => (
              <div key={fact.label} className={`py-7 px-4 md:px-6 transition-all duration-700 ${i % 2 === 0 ? "border-r border-white/8" : ""} ${i < 2 ? "border-b md:border-b-0 border-white/8" : ""} ${i === 2 ? "md:border-l md:border-white/8" : ""}`} style={{ opacity: factsInView ? 1 : 0, transform: factsInView ? "translateY(0)" : "translateY(16px)", transitionDelay: `${i * 80}ms` }}>
                <p className="font-display text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#4a9fff] mb-2">{fact.label}</p>
                <p className="font-display text-xl md:text-2xl font-700 uppercase">{fact.value}</p>
                <p className="font-body text-xs text-white/45 mt-1 leading-relaxed">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HistoryTimeline />

      {/* ── Vehicles ── */}
      <section id="veiculos" className="relative isolate bg-black py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
              Frota
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none">
              Veículos SpaceX
            </h2>
          </div>

          <div
            className="flex gap-0 mb-10 border-b border-white/8 overflow-x-auto"
            role="group"
            aria-label="Selecionar veículo"
          >
            {VEHICLES.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveVehicle(i)}
                aria-pressed={activeVehicle === i}
                aria-controls={`vehicle-panel-${i}`}
                id={`vehicle-tab-${i}`}
                className={`font-display text-[12px] font-600 tracking-[0.15em] uppercase px-6 py-4 transition-all duration-200 border-b-2 -mb-px ${
                  activeVehicle === i
                    ? "border-white text-white"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          {VEHICLES.map((v, i) => (
            <div key={i} id={`vehicle-panel-${i}`} role="region" aria-labelledby={`vehicle-tab-${i}`} hidden={activeVehicle !== i} className={activeVehicle === i ? "block" : "hidden"}>
              <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-8 md:gap-14 items-center">
                <div className="order-2 md:order-1">
                  <p className="font-display text-[11px] font-500 tracking-[0.25em] uppercase text-white/40 mb-4">
                    {v.type}
                  </p>
                  <h3 className="font-display text-6xl md:text-8xl font-800 uppercase tracking-tight leading-none mb-8">
                    {v.name}
                  </h3>
                  <p className="font-body text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-md">
                    {v.desc}
                  </p>
                  <div className="flex items-end gap-3 mb-10 pb-10 border-b border-white/8">
                    <span className="font-display text-5xl font-800 text-white">
                      {v.stat}
                    </span>
                    <span className="font-display text-[13px] font-500 tracking-[0.15em] uppercase text-white/40 mb-2">
                      {v.statLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => setModal({ kind: "vehicle", index: i })}
                    className="inline-flex items-center gap-3 font-display text-[12px] font-600 tracking-[0.15em] uppercase text-white/70 hover:text-white transition-colors group"
                  >
                    Saiba Mais
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <figure className="order-1 md:order-2">
                  <div className={`relative overflow-hidden bg-[#0A0A0A] ${v.name === "Falcon 9" ? "aspect-[3/4] md:aspect-[4/3]" : "aspect-[4/3]"}`}>
                    <img
                      src={v.img}
                      alt={v.alt}
                      loading={i === activeVehicle ? "eager" : "lazy"}
                      decoding="async"
                      className={`absolute inset-0 h-full w-full ${v.name === "Dragon" ? "object-cover" : "object-contain p-5 sm:p-8 md:p-10"}`}
                    />
                  </div>
                  <figcaption className="mt-3 text-right font-body text-xs text-white/45">
                    {v.credit}
                  </figcaption>
                </figure>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full-bleed Crew Dragon ── */}
      <section
        id="humanos"
        className="relative h-[80vh] min-h-[500px] flex items-center overflow-hidden"
      >
        <BackgroundMedia image="./images/crew-dragon-endeavour.jpg"
          alt="Crew Dragon Endeavour em órbita sobre a Terra durante a missão Crew-8" credit="NASA · Crew-8" position="70% center" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-4">
              Voos Espaciais Tripulados
            </p>
            <h2 className="font-display text-5xl md:text-8xl font-800 uppercase tracking-tight leading-none mb-6">
              Crew
              <br />
              Dragon
            </h2>
            <p className="font-body text-white/60 text-base md:text-lg leading-relaxed mb-8">
              A Dragon foi a primeira espaçonave privada a levar humanos à
              Estação Espacial Internacional, em 30 de maio de 2020. A Dragon
              é capaz de transportar até 7 passageiros.
            </p>
            <button
              onClick={() => openVehicle("Dragon")}
              className="inline-flex items-center gap-3 font-display text-[13px] font-600 tracking-[0.15em] uppercase border border-white/40 hover:border-white text-white px-8 py-4 transition-all duration-200"
            >
              Conhecer a Dragon
            </button>
          </div>
        </div>

      </section>

      <ApplicationsSection />
      <ImpactSection />

      {/* ── About ── */}
      <section id="sobre" className="relative isolate bg-[#0A0A0A] py-24 md:py-32 border-t border-white/8 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div
            ref={aboutRef}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div
              className="transition-all duration-700"
              style={{
                opacity: aboutInView ? 1 : 0,
                transform: aboutInView ? "translateX(0)" : "translateX(-32px)",
              }}
            >
              <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-4">
                Sobre este projeto
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-8">
                SpaceX
                <br />
                em contexto
              </h2>
            </div>
            <div
              className="transition-all duration-700"
              style={{
                opacity: aboutInView ? 1 : 0,
                transform: aboutInView ? "translateX(0)" : "translateX(32px)",
                transitionDelay: "150ms",
              }}
            >
              <p className="font-body text-white/60 text-base md:text-lg leading-relaxed mb-6">
                A SpaceX foi fundada em 2002 por Elon Musk. A empresa desenvolve
                foguetes, espaçonaves e serviços de conectividade por satélite.
                Seus objetivos declarados incluem ampliar o acesso ao espaço e
                desenvolver sistemas para missões à Lua e a Marte.
              </p>
              <p className="font-body text-white/50 text-sm md:text-base leading-relaxed">
                A reutilização de estágios orbitais também avança em outras
                empresas: em novembro de 2025, a Blue Origin pousou o primeiro
                estágio do New Glenn. O projeto mostra a trajetória da SpaceX
                sem apresentar uma conquista do setor como exclusividade.
              </p>
              <p className="font-body text-white/45 text-sm leading-relaxed mt-6">
                Este site é uma pesquisa de estudantes do Tech CAMPS. Não é uma
                comunicação oficial da SpaceX; marcas e mídias pertencem aos
                respectivos titulares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Minigame ── */}
      <section id="jogo" className="py-24 md:py-36 bg-[#0a0a0a] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
              Interativo
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-6">
              Pouse o Foguete
            </h2>
            <p className="font-body text-white/60 text-base md:text-lg leading-relaxed max-w-xl">
              Uma simulação didática e simplificada. Você controla a inclinação
              e o impulso; observe a velocidade vertical e horizontal, o
              combustível e a posição sobre a plataforma.
            </p>
          </div>
          <LandingGame />
          <p className="font-body text-xs text-white/40 mt-5 max-w-3xl leading-relaxed">
            No voo real, sensores, computadores, motores, atmosfera e condições
            de missão interagem de formas que este jogo não simula. A pontuação
            é apenas um retorno do jogo, não uma medida de desempenho real.
          </p>
        </div>
      </section>

      <SourcesSection />

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 2L3 28h26L16 2z"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="16" cy="16" r="3" fill="white" />
                </svg>
                <span className="font-display text-base font-700 tracking-[0.15em] uppercase">
                  Tech CAMPS
                </span>
              </div>
              <p className="font-body text-white/35 text-xs leading-relaxed">
                Pesquisa estudantil sobre tecnologia espacial e suas aplicações.
              </p>
            </div>
            {[
              { title: "Explorar", links: [{ label: "Marcos", href: "#marcos" }, { label: "Veículos", href: "#veiculos" }, { label: "Aplicações", href: "#aplicacoes" }] },
              { title: "Aprender", links: [{ label: "Impactos", href: "#impactos" }, { label: "Simulador", href: "#jogo" }] },
              { title: "Projeto", links: [{ label: "Sobre este projeto", href: "#sobre" }, { label: "Fontes", href: "#fontes" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-[11px] font-700 tracking-[0.2em] uppercase text-white/50 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-body text-xs text-white/40 hover:text-white/80 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border border-[#4a9fff]/30 bg-[rgba(74,159,255,0.06)] p-5 mb-8">
            <p className="font-display text-[11px] font-700 tracking-[0.25em] uppercase text-[#4a9fff] mb-2">
              Aviso — Fins Exclusivamente Estudantis
            </p>
            <p className="font-body text-xs md:text-sm text-white/60 leading-relaxed">
              Este site é um trabalho estudantil do Tech CAMPS, desenvolvido
              para fins educacionais e sem fins comerciais. Não possui qualquer vínculo
              oficial com a SpaceX. Marcas, nomes e fotografias pertencem aos
              seus respectivos proprietários; as imagens da Falcon 9 e da Crew
              Dragon são da NASA.
            </p>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-display text-[11px] tracking-[0.1em] uppercase text-white/25">
            © 2026 Tech CAMPS — Projeto educacional independente.
            </p>
            <div className="flex gap-6">
              {[["Fontes", "#fontes"], ["Voltar ao início", "#inicio"]].map(([label, href]) => (
                <a key={label} href={href} className="font-display text-[11px] tracking-[0.1em] uppercase text-white/35 hover:text-white/70 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <DetailModal state={modal} vehicles={VEHICLES} onClose={closeModal} />

      {/* Hero entrance keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
