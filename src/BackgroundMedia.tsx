import { memo, useEffect, useRef, useState, type CSSProperties } from 'react'

interface Props {
  image: string
  imageMobile?: string
  video?: string
  alt: string
  credit: string
  position?: string
  priority?: boolean
}

export default memo(function BackgroundMedia({ image, imageMobile, video, alt, credit, position = 'center', priority = false }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [requested, setRequested] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      setAutoPlay(!reduce.matches && !connection?.saveData)
    }
    update()
    reduce.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 })
    if (container.current) observer.observe(container.current)
    const visibility = () => setVisible(!document.hidden)
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); reduce.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility) }
  }, [])

  const shouldPlay = !!video && (autoPlay || requested) && inView && visible && !paused && !failed
  useEffect(() => { if (shouldPlay) setLoaded(true) }, [shouldPlay])
  useEffect(() => {
    const element = player.current
    if (!element) return
    let active = true
    if (shouldPlay) {
      element.muted = true
      void element.play().catch(() => { if (active) setPaused(true) })
    } else element.pause()
    return () => { active = false; element.pause() }
  }, [shouldPlay, loaded])

  return <div ref={container} className="scene-media" style={{ '--media-position': position } as CSSProperties}>
    <picture>
      {imageMobile && <source media="(max-width: 700px)" srcSet={imageMobile} />}
      <img src={image} alt={alt} width="1920" height="1080" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    </picture>
    {loaded && !failed && <video ref={player} src={video} muted loop playsInline preload="none" aria-hidden="true"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false) }}
      className={playing ? 'is-playing' : ''} />}
    <div className="scene-shade" />
    <div className="media-credit">
      <span>{credit}</span>
      {video && !failed && <button className="video-toggle" type="button"
        aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        title={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        onClick={() => { setRequested(true); setPaused(playing) }}>
        {playing ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" /></svg>}
      </button>}
    </div>
  </div>
})
