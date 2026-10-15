import { memo, useEffect, useRef, useState } from 'react'

interface Props {
  image: string
  fallback?: string
  video?: string
  alt: string
  credit: string
  position?: string
}

export default memo(function BackgroundMedia({ image, fallback, video, alt, credit, position = 'center' }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      setEnabled(!reduce.matches && !connection?.saveData)
    }
    update()
    reduce.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.08 })
    if (container.current) observer.observe(container.current)
    const visibility = () => setVisible(!document.hidden)
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); reduce.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  const loadVideo = !!video && enabled && inView && !failed
  useEffect(() => {
    const el = player.current
    if (!el) return
    let active = true
    if (loadVideo && visible && !paused) {
      el.muted = true
      void el.play().catch(() => { if (active) { setPlaying(false); setPaused(true) } })
    } else el.pause()
    return () => { active = false; el.pause() }
  }, [loadVideo, visible, paused])
  return <div ref={container} className="absolute inset-0 overflow-hidden">
    <img src={image} alt={alt} loading="lazy" decoding="async"
      onError={e => { if (fallback && !e.currentTarget.src.endsWith(fallback.replace('./', '/'))) { e.currentTarget.onerror = null; e.currentTarget.src = fallback } }}
      className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: position }} />
    {loadVideo && <video ref={player} src={video} muted loop playsInline preload="none" aria-hidden="true"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false) }}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
      style={{ objectPosition: position }} />}
    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/10 pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />
    <div className="absolute bottom-5 right-6 z-20 flex items-center gap-3 text-[10px] tracking-[0.13em] uppercase text-white/70">
      <span className="drop-shadow-lg">{credit}</span>
      {video && enabled && !failed && <button type="button" onClick={() => setPaused(p => !p)}
        aria-label={`${paused ? 'Reproduzir' : 'Pausar'} vídeo de fundo: ${alt}`}
        className="border border-white/40 bg-black/50 px-3 py-2 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white">
        {paused ? 'Reproduzir' : 'Pausar vídeo'}
      </button>}
    </div>
  </div>
})
