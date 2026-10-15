import { useEffect, useRef, useState } from "react"

const W = 800
const H = 450
const GROUND = 410
const PAD_W = 130
const ROCKET_H = 54
const GRAVITY = 55
const THRUST = 150
const TURN = 1.8
const FUEL_BURN = 16
const BEST_SCORE_KEY = "spacex-landing-best"

type Status = "idle" | "playing" | "landed" | "crashed"
type Controls = { left: boolean; right: boolean; thrust: boolean }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; hot: boolean }

interface Game {
  status: Status
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  fuel: number
  padX: number
  particles: Particle[]
  stars: { x: number; y: number; r: number; a: number }[]
  score: number
  message: string
}

function newGame(prev?: Game): Game {
  return {
    status: "idle",
    x: 120 + Math.random() * 560,
    y: 40,
    vx: (Math.random() - 0.5) * 50,
    vy: 0,
    angle: (Math.random() - 0.5) * 0.5,
    fuel: 100,
    padX: 160 + Math.random() * 480,
    particles: [],
    stars:
      prev?.stars ??
      Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * GROUND,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.2,
      })),
    score: 0,
    message: "",
  }
}

function burst(g: Game, n: number, hot: boolean) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const s = 40 + Math.random() * 200
    g.particles.push({
      x: g.x,
      y: g.y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 40,
      life: 0.6 + Math.random() * 0.8,
      hot,
    })
  }
}

function step(g: Game, c: Controls, dt: number) {
  if (g.status === "playing") {
    if (c.left) g.angle -= TURN * dt
    if (c.right) g.angle += TURN * dt
    g.vy += GRAVITY * dt
    if (c.thrust && g.fuel > 0) {
      g.fuel = Math.max(0, g.fuel - FUEL_BURN * dt)
      g.vx += Math.sin(g.angle) * THRUST * dt
      g.vy -= Math.cos(g.angle) * THRUST * dt
      const bx = g.x - Math.sin(g.angle) * (ROCKET_H / 2)
      const by = g.y + Math.cos(g.angle) * (ROCKET_H / 2)
      for (let i = 0; i < 2; i++) {
        g.particles.push({
          x: bx,
          y: by,
          vx: -Math.sin(g.angle) * 120 + (Math.random() - 0.5) * 40 + g.vx * 0.3,
          vy: Math.cos(g.angle) * 120 + (Math.random() - 0.5) * 40 + g.vy * 0.3,
          life: 0.35,
          hot: true,
        })
      }
    }
    g.x += g.vx * dt
    g.y += g.vy * dt

    if (g.x < 10 || g.x > W - 10) {
      g.x = Math.max(10, Math.min(W - 10, g.x))
      g.vx = 0
    }
    if (g.y < 10) {
      g.y = 10
      g.vy = Math.max(0, g.vy)
    }

    if (g.y + ROCKET_H / 2 >= GROUND) {
      g.y = GROUND - ROCKET_H / 2
      const onPad = Math.abs(g.x - g.padX) < PAD_W / 2 - 6
      const soft = g.vy < 45 && Math.abs(g.vx) < 30 && Math.abs(g.angle) < 0.22
      if (onPad && soft) {
        g.status = "landed"
        g.score = Math.round(g.fuel * 10 + (45 - g.vy) * 5)
        g.message = "Pouso confirmado!"
        g.vx = g.vy = 0
      } else {
        g.status = "crashed"
        g.message = !onPad
          ? "Errou a plataforma"
          : g.vy >= 45
            ? "Velocidade alta demais"
            : "Ângulo inclinado demais"
        burst(g, 70, true)
        burst(g, 30, false)
      }
    }
  }
  for (const p of g.particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += (g.status === "crashed" ? 120 : 0) * dt
    p.life -= dt
  }
  g.particles = g.particles.filter((p) => p.life > 0)
}

function drawRocket(ctx: CanvasRenderingContext2D, g: Game, thrust: boolean) {
  ctx.save()
  ctx.translate(g.x, g.y)
  ctx.rotate(g.angle)
  const h = ROCKET_H
  // legs
  ctx.strokeStyle = "#cfd6df"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-5, h / 2 - 10)
  ctx.lineTo(-15, h / 2)
  ctx.moveTo(5, h / 2 - 10)
  ctx.lineTo(15, h / 2)
  ctx.stroke()
  // body
  ctx.fillStyle = "#f2f4f7"
  ctx.fillRect(-6, -h / 2 + 8, 12, h - 16)
  ctx.fillStyle = "#1a1d22"
  ctx.fillRect(-6, -h / 2 + 18, 12, 6)
  // nose
  ctx.fillStyle = "#f2f4f7"
  ctx.beginPath()
  ctx.moveTo(-6, -h / 2 + 8)
  ctx.quadraticCurveTo(0, -h / 2 - 6, 6, -h / 2 + 8)
  ctx.fill()
  // grid fins / engine
  ctx.fillStyle = "#4a9fff"
  ctx.fillRect(-9, -h / 2 + 12, 3, 3)
  ctx.fillRect(6, -h / 2 + 12, 3, 3)
  ctx.fillStyle = "#555c66"
  ctx.fillRect(-4, h / 2 - 8, 8, 5)
  if (thrust) {
    const len = 14 + Math.random() * 10
    const grad = ctx.createLinearGradient(0, h / 2 - 3, 0, h / 2 + len)
    grad.addColorStop(0, "#ffffff")
    grad.addColorStop(0.4, "#4a9fff")
    grad.addColorStop(1, "rgba(74,159,255,0)")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-4, h / 2 - 3)
    ctx.lineTo(4, h / 2 - 3)
    ctx.lineTo(0, h / 2 + len)
    ctx.fill()
  }
  ctx.restore()
}

function draw(ctx: CanvasRenderingContext2D, g: Game, c: Controls, best: number) {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)
  for (const s of g.stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.a})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  // sea + horizon
  const sea = ctx.createLinearGradient(0, GROUND, 0, H)
  sea.addColorStop(0, "#0b1a2b")
  sea.addColorStop(1, "#02060b")
  ctx.fillStyle = sea
  ctx.fillRect(0, GROUND, W, H - GROUND)
  ctx.fillStyle = "rgba(74,159,255,0.5)"
  ctx.fillRect(0, GROUND, W, 1)
  // barge
  const px = g.padX - PAD_W / 2
  ctx.fillStyle = "#2a2f36"
  ctx.fillRect(px, GROUND - 4, PAD_W, 12)
  ctx.fillStyle = "#4a9fff"
  ctx.fillRect(px, GROUND - 5, PAD_W, 2)
  ctx.fillStyle = "#fff"
  ctx.font = "700 11px 'Barlow Condensed', sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("X", g.padX, GROUND + 5)

  // particles
  for (const p of g.particles) {
    const a = Math.max(0, Math.min(1, p.life * 2))
    ctx.fillStyle = p.hot ? `rgba(120,190,255,${a})` : `rgba(200,200,200,${a * 0.6})`
    ctx.fillRect(p.x, p.y, 2.5, 2.5)
  }

  if (g.status !== "crashed") drawRocket(ctx, g, g.status === "playing" && c.thrust && g.fuel > 0)

  // HUD
  const alt = Math.max(0, Math.round(GROUND - (g.y + ROCKET_H / 2)))
  const hud = [
    ["ALTITUDE", `${alt} m`, false],
    ["VEL. VERT.", `${g.vy.toFixed(0)} m/s`, g.vy >= 45],
    ["VEL. HORIZ.", `${g.vx.toFixed(0)} m/s`, Math.abs(g.vx) >= 30],
    ["COMBUSTÍVEL", `${g.fuel.toFixed(0)}%`, g.fuel < 20],
  ] as const
  ctx.textAlign = "left"
  hud.forEach(([label, value, warn], i) => {
    const x = 20 + i * 130
    ctx.fillStyle = "rgba(255,255,255,0.4)"
    ctx.font = "500 10px 'Barlow Condensed', sans-serif"
    ctx.fillText(label, x, 26)
    ctx.fillStyle = warn ? "#ff6b5e" : "#fff"
    ctx.font = "700 20px 'Barlow Condensed', sans-serif"
    ctx.fillText(value, x, 48)
  })
  ctx.textAlign = "right"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.font = "500 10px 'Barlow Condensed', sans-serif"
  ctx.fillText("RECORDE", W - 20, 26)
  ctx.fillStyle = "#4a9fff"
  ctx.font = "700 20px 'Barlow Condensed', sans-serif"
  ctx.fillText(String(best), W - 20, 48)

  // overlay
  if (g.status !== "playing") {
    ctx.fillStyle = "rgba(0,0,0,0.55)"
    ctx.fillRect(0, 0, W, H)
    ctx.textAlign = "center"
    let title = "Pouse o Foguete"
    let sub = "Clique ou pressione ESPAÇO para começar"
    let color = "#fff"
    if (g.status === "landed") {
      title = g.message
      sub = `Pontuação: ${g.score}  ·  Clique ou ESPAÇO para jogar de novo`
      color = "#4a9fff"
    } else if (g.status === "crashed") {
      title = g.message
      sub = "Clique ou ESPAÇO para tentar de novo"
      color = "#ff6b5e"
    }
    ctx.fillStyle = color
    ctx.font = "800 44px 'Barlow Condensed', sans-serif"
    ctx.fillText(title.toUpperCase(), W / 2, H / 2 - 6)
    ctx.fillStyle = "rgba(255,255,255,0.65)"
    ctx.font = "400 14px Inter, sans-serif"
    ctx.fillText(sub, W / 2, H / 2 + 24)
    if (g.status === "idle") {
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.font = "400 12px Inter, sans-serif"
      ctx.fillText(
        "← → ou A/D giram  ·  ↑, W ou ESPAÇO acende o propulsor",
        W / 2,
        H / 2 + 50,
      )
    }
  }
}

export default function LandingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game>(newGame())
  const controls = useRef<Controls>({ left: false, right: false, thrust: false })
  const visible = useRef(false)
  const bestRef = useRef(0)
  const wakeRef = useRef<() => void>(() => {})
  const [, setTouch] = useState(0)

  const startOrRestart = () => {
    const g = gameRef.current
    if (g.status === "playing") return
    gameRef.current = newGame(g)
    gameRef.current.status = "playing"
    wakeRef.current()
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let raf = 0
    let last = 0
    let running = false

    try {
      const stored = Number(localStorage.getItem(BEST_SCORE_KEY))
      if (Number.isInteger(stored) && stored >= 0) bestRef.current = stored
    } catch {
      bestRef.current = 0
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round((w * H * dpr) / W)
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0)
      draw(ctx, gameRef.current, controls.current, bestRef.current)
    }

    const frame = (now: number) => {
      if (!visible.current) {
        running = false
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = gameRef.current
      const before = g.status
      step(g, controls.current, dt)
      if (before === "playing" && g.status === "landed") {
        if (g.score > bestRef.current) {
          bestRef.current = g.score
          try {
            localStorage.setItem(BEST_SCORE_KEY, String(g.score))
          } catch {
            // The game remains playable when storage is blocked or unavailable.
          }
        }
      }
      draw(ctx, g, controls.current, bestRef.current)
      raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (running || !visible.current) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    wakeRef.current = wake

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (e.isIntersecting) wake()
    })
    io.observe(canvas)
    resize()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const setKey = (e: React.KeyboardEvent, down: boolean) => {
    const k = e.key.toLowerCase()
    const c = controls.current
    let handled = true
    if (k === "arrowleft" || k === "a") c.left = down
    else if (k === "arrowright" || k === "d") c.right = down
    else if (k === "arrowup" || k === "w") c.thrust = down
    else if (k === " " || k === "enter") {
      if (gameRef.current.status === "playing") c.thrust = down
      else if (down) startOrRestart()
    } else handled = false
    if (handled) e.preventDefault()
  }

  const hold = (key: keyof Controls) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      if (gameRef.current.status !== "playing") startOrRestart()
      controls.current[key] = true
      setTouch((n) => n + 1)
    },
    onPointerUp: () => {
      controls.current[key] = false
      setTouch((n) => n + 1)
    },
    onPointerCancel: () => {
      controls.current[key] = false
      setTouch((n) => n + 1)
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  })

  const btn =
    "select-none touch-none flex-1 md:hidden font-display text-[12px] font-600 tracking-[0.15em] uppercase py-4 border border-white/30 text-white/80 active:bg-white active:text-black transition-colors"

  return (
    <div id="landing-game-slot" className="w-full">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="application"
        aria-label="Minigame de pouso de foguete. Use as setas para girar e a seta para cima para acelerar."
        onKeyDown={(e) => setKey(e, true)}
        onKeyUp={(e) => setKey(e, false)}
        onBlur={() => {
          controls.current = { left: false, right: false, thrust: false }
        }}
        onClick={(e) => {
          e.currentTarget.focus()
          if (gameRef.current.status !== "playing") startOrRestart()
        }}
        className="block w-full aspect-[16/9] min-h-[240px] bg-black border border-white/10 focus:border-[#4a9fff]/60 outline-none cursor-pointer"
      />
      <div className="flex gap-2 mt-2">
        <button className={btn} {...hold("left")}>
          ◀ Girar
        </button>
        <button className={btn} {...hold("thrust")}>
          ▲ Propulsor
        </button>
        <button className={btn} {...hold("right")}>
          Girar ▶
        </button>
      </div>
      <p className="font-body text-xs text-white/35 mt-3">
        Pouse sobre a plataforma com velocidade vertical abaixo de 45 m/s,
        horizontal abaixo de 30 m/s e o foguete quase na vertical.
      </p>
    </div>
  )
}
