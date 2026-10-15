import { useState, useEffect, useRef, useCallback } from "react"
import { useLaunches } from "./useLaunches"
import { orderLaunches, missionFromLaunch } from "./launches"
import LandingGame from "./LandingGame"
import DetailModal, { type ModalState } from "./DetailModal"

// ─── Hooks ────────────────────────────────────────────────────────────────────

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function useCountdown(target: Date): Countdown {
  const calc = () => {
    const diff = target.getTime() - Date.now()
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      expired: false,
    }
  }
  const [tick, setTick] = useState<Countdown>(calc)
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000)
    return () => clearInterval(id)
  }, [target])
  return tick
}

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

function useCountUp(target: number, duration = 1400, active = false): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target * 10) / 10)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, target, duration])

  return count
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Missões", id: "missoes" },
  { label: "Veículos", id: "veiculos" },
  { label: "Lançamentos", id: "lancamentos" },
  { label: "Humanos", id: "humanos" },
  { label: "Sobre", id: "sobre" },
  { label: "Simulador", id: "jogo" },
]

const VEHICLES = [
  {
    name: "Falcon 9",
    type: "Foguete Orbital",
    desc: "O primeiro foguete reutilizável de classe orbital do mundo. Confiabilidade por meio da reutilização.",
    stat: "330+",
    statLabel: "Lançamentos",
    img: "./images/falcon-9-demo-2.jpg",
    alt: "Falcon 9 da SpaceX decolando com a Crew Dragon durante a missão Demo-2 da NASA",
    credit: "DEMO-2 · NASA / JOEL KOWSKY",
  },
  {
    name: "Starship",
    type: "Próxima Geração",
    desc: "Sistema de transporte totalmente reutilizável projetado para levar tripulação e carga à órbita da Terra, à Lua, a Marte e além.",
    stat: "150t",
    statLabel: "Carga útil até a LEO",
    img: "https://images.unsplash.com/photo-1614729375290-b2a429db839b?w=800&h=1000&fit=crop&auto=format",
    alt: "Starship",
    credit: null,
  },
  {
    name: "Dragon",
    type: "Espaçonave",
    desc: "A primeira espaçonave privada a entregar carga à Estação Espacial Internacional e a trazer astronautas de volta à Terra.",
    stat: "45+",
    statLabel: "Missões",
    img: "./images/crew-dragon-endeavour.jpg",
    alt: "Crew Dragon Endeavour se aproximando da Estação Espacial Internacional acima da Terra durante a Crew-8",
    credit: "CREW-8 · NASA",
  },
]

const RAW_STATS = [
  { raw: 395, suffix: "", label: "Total de Lançamentos" },
  { raw: 353, suffix: "", label: "Pousos Bem-Sucedidos" },
  { raw: 312, suffix: "", label: "Reutilizações" },
  { raw: 99.5, suffix: "%", label: "Sucesso das Missões" },
]

type FooterLink = {
  label: string
  href?: string
  vehicle?: string
  expand?: boolean
  notice?: boolean
}

const FOOTER_COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Veículos",
    links: [
      { label: "Falcon 9", vehicle: "Falcon 9" },
      { label: "Falcon Heavy", href: "#veiculos" },
      { label: "Dragon", vehicle: "Dragon" },
      { label: "Starship", vehicle: "Starship" },
    ],
  },
  {
    title: "Missões",
    links: [
      { label: "Todas as Missões", href: "#lancamentos", expand: true },
      { label: "ISS", href: "#humanos" },
      { label: "Lua", vehicle: "Starship" },
      { label: "Marte", vehicle: "Starship" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Carreiras", notice: true },
      { label: "Notícias", notice: true },
      { label: "Contato", notice: true },
    ],
  },
]


// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl md:text-4xl font-800 tabular-nums leading-none tracking-tight text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-display text-[9px] font-500 tracking-[0.2em] uppercase text-white/35 mt-1">
        {label}
      </span>
    </div>
  )
}

function HeroCountdown({ mission }: { mission: { name: string; launchAt: Date } }) {
  const cd = useCountdown(mission.launchAt)
  if (cd.expired) return null
  return (
    <div className="mt-10 pt-10 border-t border-white/10">
      <p className="font-display text-[10px] font-500 tracking-[0.25em] uppercase text-[#4a9fff] mb-4">
        Próximo Lançamento — {mission.name}
      </p>
      <div className="flex items-start gap-5 md:gap-8">
        <CountdownUnit value={cd.days} label="Dias" />
        <span className="font-display text-2xl font-300 text-white/20 mt-1">
          :
        </span>
        <CountdownUnit value={cd.hours} label="Horas" />
        <span className="font-display text-2xl font-300 text-white/20 mt-1">
          :
        </span>
        <CountdownUnit value={cd.minutes} label="Min" />
        <span className="font-display text-2xl font-300 text-white/20 mt-1">
          :
        </span>
        <CountdownUnit value={cd.seconds} label="Seg" />
      </div>
    </div>
  )
}

function MissionRowCountdown({ launchAt }: { launchAt: Date }) {
  const cd = useCountdown(launchAt)
  if (cd.expired)
    return (
      <span className="font-display text-[11px] font-600 tracking-[0.15em] uppercase px-3 py-1.5 bg-[rgba(74,159,255,0.15)] text-[#4a9fff]">
        Aguardando atualização
      </span>
    )
  return (
    <div className="flex items-center gap-1.5">
      {[
        { v: cd.days, l: "D" },
        { v: cd.hours, l: "H" },
        { v: cd.minutes, l: "M" },
        { v: cd.seconds, l: "S" },
      ].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center bg-[rgba(74,159,255,0.08)] border border-[rgba(74,159,255,0.2)] px-1.5 py-1 min-w-[32px]">
            <span className="font-display text-[13px] font-700 tabular-nums leading-none text-[#4a9fff]">
              {String(v).padStart(2, "0")}
            </span>
            <span className="font-display text-[8px] font-500 tracking-[0.15em] text-[#4a9fff]/50">
              {l}
            </span>
          </div>
          {i < 3 && (
            <span className="font-display text-[10px] text-white/20">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

function StatCard({
  raw,
  suffix,
  label,
  index,
  active,
}: {
  raw: number
  suffix: string
  label: string
  index: number
  active: boolean
}) {
  const count = useCountUp(raw, 1200 + index * 120, active)
  const display =
    raw % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toString()

  return (
    <div
      className={`py-8 px-6 text-center transition-all duration-700 ${
        index < RAW_STATS.length - 1 ? "border-r border-white/8" : ""
      }`}
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="font-display text-4xl md:text-5xl font-800 tracking-tight text-white mb-1">
        {display}
        {suffix}
      </div>
      <div className="font-display text-[11px] font-500 tracking-[0.2em] uppercase text-white/40">
        {label}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeVehicle, setActiveVehicle] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)
  const [showAll, setShowAll] = useState(false)
  const closeModal = useCallback(() => setModal(null), [])
  const openVehicle = (name: string) => {
    const index = VEHICLES.findIndex((v) => v.name === name)
    if (index >= 0) setModal({ kind: "vehicle", index })
  }
  const onFooterLink = (e: React.MouseEvent, l: FooterLink) => {
    if (l.vehicle) {
      e.preventDefault()
      openVehicle(l.vehicle)
    } else if (l.notice) {
      e.preventDefault()
      setModal({ kind: "notice", title: l.label })
    } else if (l.expand) setShowAll(true)
  }
  const { snapshot, loading, error, now, stale } = useLaunches()
  const allMissions = orderLaunches(snapshot?.launches ?? [], now).map(l => missionFromLaunch(l, now))
  const nextLaunch = allMissions.find(m => [1, 2, 8].includes(m.statusId) && m.launchAt && m.launchAt.getTime() > now)
  const previewMissions = [
    ...allMissions.filter(m => ![3, 4, 7, 9].includes(m.statusId)).slice(0, 3),
    ...allMissions.filter(m => [3, 4, 7, 9].includes(m.statusId)).slice(0, 3),
  ]
  const missions = showAll ? allMissions : previewMissions
  const currentModal = modal?.kind === "mission"
    ? { ...modal, mission: allMissions.find(m => m.id === modal.mission.id) ?? modal.mission }
    : modal

  // Section refs + inView state
  const [statsRef, statsInView] = useInView({ threshold: 0.2 })
  const [vehiclesRef, vehiclesInView] = useInView({ threshold: 0.1 })
  const [missionsRef, missionsInView] = useInView({ threshold: 0.1 })
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
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
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
              SPACEX
            </span>
          </a>

          <ul className="hidden lg:flex items-center gap-6">
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
              onClick={() =>
                nextLaunch ? setModal({ kind: "mission", mission: nextLaunch }) : document.getElementById("lancamentos")?.scrollIntoView({ behavior: "smooth" })
              }
              className="hidden lg:inline-flex items-center gap-2 font-display text-[12px] font-600 tracking-[0.15em] uppercase px-5 py-2.5 border border-white/30 hover:border-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Próximo Lançamento
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col gap-1.5 p-1"
              aria-label="Menu"
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
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-64 border-t border-white/8" : "max-h-0"
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
        id="missoes"
        className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1920&h=1080&fit=crop&auto=format"
          alt="Foguete decolando da plataforma de lançamento"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24 md:pt-32 md:pb-28 w-full">
          <p
            className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-4"
            style={{ animation: "fadeUp 0.8s ease forwards 0.3s", opacity: 0 }}
          >
            Tornando a Vida Multiplanetária
          </p>
          <h1
            className="font-display text-[72px] md:text-[120px] font-800 leading-none tracking-tight uppercase mb-6 max-w-4xl"
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
            A SpaceX projeta, fabrica e lança foguetes e espaçonaves avançados
            com o objetivo final de possibilitar a vida em vários planetas.
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
              href="#lancamentos"
              className="inline-flex items-center gap-3 font-display text-[13px] font-600 tracking-[0.15em] uppercase border border-white/30 text-white px-8 py-4 hover:border-white transition-colors duration-200"
            >
              Últimos Lançamentos
            </a>
          </div>

          <div
            style={{ animation: "fadeUp 0.9s ease forwards 1.1s", opacity: 0 }}
          >
            {nextLaunch?.countdown && nextLaunch.launchAt && !stale && !error && <HeroCountdown mission={{ name: nextLaunch.name, launchAt: nextLaunch.launchAt }} />}
          </div>
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
      <div ref={statsRef} className="border-y border-white/8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {RAW_STATS.map((s, i) => (
              <StatCard key={i} {...s} index={i} active={statsInView} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Vehicles ── */}
      <section id="veiculos" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          {/* Heading slides in from left */}
          <div
            ref={vehiclesRef}
            className="mb-16 transition-all duration-700"
            style={{
              opacity: vehiclesInView ? 1 : 0,
              transform: vehiclesInView ? "translateX(0)" : "translateX(-40px)",
            }}
          >
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
              Frota
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none">
              Nossos Veículos
            </h2>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-0 mb-12 border-b border-white/8 transition-all duration-700"
            style={{
              opacity: vehiclesInView ? 1 : 0,
              transitionDelay: "150ms",
            }}
          >
            {VEHICLES.map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveVehicle(i)}
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

          {/* Vehicle panels — content slides in from bottom, image from right */}
          {VEHICLES.map((v, i) => (
            <div key={i} className={activeVehicle === i ? "block" : "hidden"}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div
                  className="order-2 md:order-1 transition-all duration-700"
                  style={{
                    opacity: vehiclesInView ? 1 : 0,
                    transform: vehiclesInView
                      ? "translateY(0)"
                      : "translateY(32px)",
                    transitionDelay: "250ms",
                  }}
                >
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

                <div
                  className="order-1 md:order-2 relative aspect-[3/4] max-h-[520px] bg-[#0a0a0a] overflow-hidden transition-all duration-700"
                  style={{
                    opacity: vehiclesInView ? 1 : 0,
                    transform: vehiclesInView
                      ? "translateX(0)"
                      : "translateX(40px)",
                    transitionDelay: "350ms",
                  }}
                >
                  <img
                    src={v.img}
                    alt={v.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {v.credit && (
                    <span className="absolute bottom-5 left-5 font-display text-xs tracking-widest text-white/60">
                      {v.credit}
                    </span>
                  )}
                </div>
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
        <img
          src="./images/crew-dragon-endeavour.jpg"
          alt="Crew Dragon Endeavour sobrevoando o Oceano Índico em aproximação à Estação Espacial Internacional"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full md:left-auto md:right-0 md:w-2/3 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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
        <span className="absolute bottom-6 right-6 z-10 font-display text-xs tracking-widest text-white/60">
          ENDEAVOUR / CREW-8 · FOTO: NASA
        </span>
      </section>

      {/* ── Launches ── */}
      <section id="lancamentos" className="py-24 md:py-36 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
                Registro de Missões
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none">
                Lançamentos
              </h2>
            </div>
            <button
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls="lista-lancamentos"
              className="self-start md:self-auto inline-flex items-center gap-2 font-display text-[12px] font-600 tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors group"
            >
              {showAll ? "Mostrar Menos" : "Ver mais lançamentos"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`transition-transform duration-200 ${
                  showAll ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M2.5 5l4.5 4 4.5-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="mb-8 text-sm text-white/55 space-y-2" aria-live="polite">
            <p>Dados de <a href="https://thespacedevs.com/llapi" target="_blank" rel="noreferrer" className="text-[#4a9fff] underline">The Space Devs · Launch Library 2</a>. Horários de Brasília.</p>
            <p>Atualização programada a cada 30 minutos; pode haver atrasos. Datas sujeitas a alteração.</p>
            {snapshot && <p>Última consulta: {new Date(snapshot.fetchedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.</p>}
            {loading && <p>Carregando lançamentos da SpaceX…</p>}
            {(stale || error) && <p className="text-amber-300">{snapshot ? "Atualização indisponível ou atrasada. Exibindo a última consulta; os dados podem ter mudado." : "Não foi possível carregar os lançamentos. Tente novamente em alguns minutos."}</p>}
            {!loading && !error && !allMissions.length && <p>Nenhum lançamento disponível no momento.</p>}
          </div>
          {/* Mission rows — stagger-fade */}
          <div
            id="lista-lancamentos"
            ref={missionsRef}
            className="divide-y divide-white/8"
          >
            {missions.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModal({ kind: "mission", mission: m })}
                aria-label={`Ver detalhes da missão ${m.name}`}
                className="w-full text-left flex flex-col md:flex-row md:items-center gap-4 md:gap-0 py-6 group cursor-pointer hover:bg-white/[0.02] px-4 -mx-4 transition-colors duration-200"
                style={{
                  opacity: missionsInView ? 1 : 0,
                  transform: missionsInView
                    ? "translateY(0)"
                    : "translateY(16px)",
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                  transitionDelay: missionsInView ? `${Math.min(i, 5) * 100}ms` : "0ms",
                }}
              >
                <div className="font-display text-[12px] font-500 tracking-[0.1em] text-white/35 md:w-40">
                  {m.date}
                </div>
                <div className="flex-1">
                  <span className="font-display text-xl font-700 tracking-tight group-hover:text-[#4a9fff] transition-colors duration-200">
                    {m.name}
                  </span>
                </div>
                <div className="font-display text-[12px] font-500 tracking-[0.1em] uppercase text-white/40 md:w-56">
                  {m.vehicle}
                </div>
                <div className="md:w-48 flex items-center">
                  {m.countdown && m.launchAt && !stale && !error ? (
                    <MissionRowCountdown launchAt={m.launchAt} />
                  ) : (
                    <span className="font-display text-[11px] font-600 tracking-[0.15em] uppercase px-3 py-1.5 bg-white/8 text-white/60">
                      {m.status}
                    </span>
                  )}
                </div>
                <div className="font-display text-[11px] font-500 tracking-[0.05em] text-white/30 md:w-52 hidden lg:block">
                  {m.location}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="sobre" className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
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
                Nossa Missão
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-8">
                Por que
                <br />
                Construímos
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
                A SpaceX foi fundada em 2002 com o objetivo final de possibilitar a
                vida humana em vários planetas. Acreditamos que um futuro em que
                a humanidade explora as estrelas é fundamentalmente mais
                empolgante do que um em que isso não acontece.
              </p>
              <p className="font-body text-white/50 text-sm md:text-base leading-relaxed">
                Hoje a SpaceX é a principal provedora de lançamentos do mundo e a
                única empresa a construir e operar com sucesso foguetes
                reutilizáveis de classe orbital.
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
              Controle o propulsor e tente pousar o primeiro estágio com
              segurança, como a Falcon 9 faz de verdade.
            </p>
          </div>
          <LandingGame />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
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
                  SpaceX
                </span>
              </div>
              <p className="font-body text-white/35 text-xs leading-relaxed">
                Projetando o futuro dos voos espaciais tripulados desde 2002.
              </p>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-[11px] font-700 tracking-[0.2em] uppercase text-white/50 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href ?? "#"}
                        onClick={(e) => onFooterLink(e, link)}
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
              Este site é um trabalho escolar, desenvolvido apenas para fins
              estudantis e sem fins comerciais. Não possui qualquer vínculo
              oficial com a SpaceX. Marcas, nomes e fotografias pertencem aos
              seus respectivos proprietários; as imagens da Falcon 9 e da Crew
              Dragon são da NASA.
            </p>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-display text-[11px] tracking-[0.1em] uppercase text-white/25">
              © 2026 SpaceX — Projeto escolar, uso estudantil.
            </p>
            <div className="flex gap-6">
              {["Privacidade", "Termos", "Fornecedores"].map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setModal({ kind: "notice", title: link })
                  }}
                  className="font-display text-[11px] tracking-[0.1em] uppercase text-white/25 hover:text-white/60 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <DetailModal state={currentModal} vehicles={VEHICLES} onClose={closeModal} />

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
