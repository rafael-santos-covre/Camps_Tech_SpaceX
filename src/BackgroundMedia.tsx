import { memo, useEffect, useRef, useState } from 'react'

interface Props {
  image: string
  imageMobile?: string
  fallback?: string
  video?: string
  alt: string
  credit: string
  position?: string
  priority?: boolean
}

export default memo(function BackgroundMedia({ image, imageMobile, fallback, video, alt, credit, position = 'center', priority = false }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const largeScreen = matchMedia('(min-width: 768px)')
    const update = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      setEnabled(!reduce.matches && !connection?.saveData)
      setIsLargeScreen(largeScreen.matches)
    }
    update()
    reduce.addEventListener('change', update)
    largeScreen.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.08 })
    if (container.current) observer.observe(container.current)
    const visibility = () => setVisible(!document.hidden)
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); reduce.removeEventListener('change', update); largeScreen.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  const loadVideo = !!video && enabled && inView && !failed && isLargeScreen
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
    <picture className="absolute inset-0 h-full w-full">
      {imageMobile && <source media="(max-width: 767px)" srcSet={imageMobile} />}
      <img src={image} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"
        onError={e => { if (fallback && !e.currentTarget.src.endsWith(fallback.replace('./', '/'))) { e.currentTarget.onerror = null; e.currentTarget.parentElement?.querySelector('source')?.removeAttribute('srcset'); e.currentTarget.src = fallback } }}
        className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: position }} />
    </picture>
    {loadVideo && <video ref={player} src={video} muted loop playsInline preload="none" aria-hidden="true"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false) }}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
      style={{ objectPosition: position }} />}
    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/10 pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />
    <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-6 z-20 flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] tracking-[0.1em] uppercase text-white/70 max-w-[calc(100%-1.5rem)]">
      <span className="drop-shadow-lg">{credit}</span>
      {video && isLargeScreen && !failed && <button type="button" onClick={() => { if (!enabled) { setEnabled(true); setPaused(false) } else setPaused(p => !p) }}
        aria-label={`${!enabled || paused ? 'Reproduzir' : 'Pausar'} vídeo de fundo: ${alt}`}
        className="border border-white/40 bg-black/50 px-3 py-2 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white">
        {!enabled || paused ? 'Reproduzir vídeo' : 'Pausar vídeo'}
      </button>}
    </div>
  </div>
})

