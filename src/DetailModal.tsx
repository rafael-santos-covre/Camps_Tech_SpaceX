import { useEffect, useRef } from "react"

export interface VehicleLike {
  name: string
  type: string
  desc: string
  img: string
  alt: string
  credit: string | null
}

export interface MissionLike {
  date: string
  id: string
  precise: boolean
  statusId: number
  launchAt: Date | null
  name: string
  vehicle: string
  status: string
  location: string
}

export type ModalState =
  | { kind: "vehicle"; index: number }
  | { kind: "mission"; mission: MissionLike }
  | { kind: "notice"; title: string }
  | null

const DETAILS: Record<
  string,
  { history: string; specs: [string, string][]; highlights: string[] }
> = {
  "Falcon 9": {
    history:
      "O Falcon 9 voou pela primeira vez em 2010. Em dezembro de 2015, o primeiro estágio realizou o primeiro pouso vertical bem-sucedido de um foguete orbital, abrindo caminho para a reutilização rotineira.",
    specs: [
      ["Altura", "70 m"],
      ["Diâmetro", "3,7 m"],
      ["Massa na decolagem", "549 t"],
      ["Carga útil (LEO)", "22,8 t"],
      ["Carga útil (GTO)", "8,3 t"],
      ["Motores (1º estágio)", "9 × Merlin"],
    ],
    highlights: [
      "Primeiro estágio reutilizável com pouso em terra ou em navio-plataforma",
      "Usado para missões de satélites, cargas e tripulação",
      "Propelentes: querosene (RP-1) e oxigênio líquido",
    ],
  },
  Starship: {
    history:
      "A Starship é o sistema de transporte totalmente reutilizável em desenvolvimento para levar pessoas e carga à órbita, à Lua e a Marte. É composta pelo propulsor Super Heavy e pela nave Starship.",
    specs: [
      ["Altura (conjunto)", "121 m"],
      ["Diâmetro", "9 m"],
      ["Motores Super Heavy", "33 × Raptor"],
      ["Motores da nave", "6 × Raptor"],
      ["Carga útil (LEO)", "100–150 t"],
      ["Propelentes", "Metano e O₂ líquidos"],
    ],
    highlights: [
      "Os dois estágios foram projetados para voltar e serem reutilizados",
      "Reabastecimento em órbita para missões além da Terra",
      "Candidata a missões lunares e marcianas",
    ],
  },
  Dragon: {
    history:
      "Em 2012, a Dragon se tornou a primeira espaçonave privada a atracar na Estação Espacial Internacional. Em 30 de maio de 2020, a Crew Dragon Endeavour levou astronautas à ISS na missão Demo-2.",
    specs: [
      ["Diâmetro", "4 m"],
      ["Altura (com nariz)", "8,1 m"],
      ["Capacidade", "até 7 pessoas"],
      ["Volume pressurizado", "9,3 m³"],
      ["Primeiro voo tripulado", "30 mai 2020"],
      ["Pouso", "Mar, com paraquedas"],
    ],
    highlights: [
      "Sistema de escape de lançamento para segurança da tripulação",
      "Acoplamento automático com a ISS",
      "Cápsula reutilizável em várias missões",
    ],
  },
}

export default function DetailModal({
  state,
  vehicles,
  onClose,
}: {
  state: ModalState
  vehicles: VehicleLike[]
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [state, onClose])

  if (!state) return null

  const v = state.kind === "vehicle" ? vehicles[state.index] : null
  const d = v ? DETAILS[v.name] : null
  const mission = state.kind === "mission" ? state.mission : null
  const title = v
    ? v.name
    : mission
      ? mission.name
      : state.kind === "notice"
        ? state.title
        : ""
  const missionDate = mission?.launchAt && mission.precise && mission.statusId !== 2
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(mission.launchAt) + " (Brasília)"
    : mission?.date ?? "Data a definir"

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-full overflow-y-auto bg-[#0a0a0a] border border-white/10"
        style={{ animation: "modalIn 0.3s ease forwards" }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/30 hover:bg-white hover:text-black transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {v && d ? (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px] bg-black">
              <img
                src={v.img}
                alt={v.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              {v.credit && (
                <span className="absolute bottom-4 left-4 font-display text-xs tracking-widest text-white/60">
                  {v.credit}
                </span>
              )}
            </div>
            <div className="p-6 md:p-10">
              <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
                {v.type}
              </p>
              <h3 className="font-display text-5xl md:text-7xl font-800 uppercase tracking-tight leading-none mb-6">
                {v.name}
              </h3>
              <p className="font-body text-white/60 text-sm md:text-base leading-relaxed mb-8">
                {d.history}
              </p>
              <dl className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mb-8">
                {d.specs.map(([k, val]) => (
                  <div key={k} className="bg-[#0a0a0a] p-4">
                    <dt className="font-display text-[10px] font-500 tracking-[0.2em] uppercase text-white/40 mb-1">
                      {k}
                    </dt>
                    <dd className="font-display text-xl font-700 tracking-tight">
                      {val}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="space-y-2">
                {d.highlights.map((h) => (
                  <li
                    key={h}
                    className="font-body text-sm text-white/55 flex gap-3"
                  >
                    <span className="text-[#4a9fff]">—</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : mission ? (
          <div className="p-8 md:p-14 max-w-3xl">
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
              Detalhes da Missão
            </p>
            <div className="flex flex-wrap items-end gap-4 mb-8">
              <h3 className="font-display text-4xl md:text-6xl font-800 uppercase tracking-tight leading-none">
                {mission.name}
              </h3>
              <span className="font-display text-[11px] font-600 tracking-[0.15em] uppercase px-3 py-1.5 bg-white/8 text-white/60">
                {mission.status}
              </span>
            </div>
            <dl className="grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {[
                ["Veículo", mission.vehicle],
                ["Data e horário", missionDate],
                ["Local de lançamento", mission.location],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`bg-[#0a0a0a] p-5 ${
                    index === 2 ? "sm:col-span-2" : ""
                  }`}
                >
                  <dt className="font-display text-[10px] font-500 tracking-[0.2em] uppercase text-white/40 mb-2">
                    {label}
                  </dt>
                  <dd className="font-body text-sm md:text-base text-white/75 leading-relaxed">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="p-8 md:p-14 max-w-2xl">
            <p className="font-display text-[11px] font-500 tracking-[0.3em] uppercase text-[#4a9fff] mb-3">
              Projeto escolar
            </p>
            <h3 className="font-display text-4xl md:text-6xl font-800 uppercase tracking-tight leading-none mb-6">
              {title}
            </h3>
            <p className="font-body text-white/60 text-base leading-relaxed">
              Esta página não existe de verdade: o site é um trabalho escolar,
              feito apenas para fins estudantis e sem vínculo oficial com a
              SpaceX.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
