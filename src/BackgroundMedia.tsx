import { memo, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from 'react'

export interface BackgroundMediaHandle { start: () => void }

interface Props {
  image: string
  imageMobile?: string
  video?: string
  alt: string
  credit: string
  position?: string
  priority?: boolean
  playbackEnabled?: boolean
  playbackRef?: Ref<BackgroundMediaHandle>
}

export default memo(function BackgroundMedia({ image, imageMobile, video, alt, credit, position = 'center', priority = false, playbackEnabled = true, playbackRef }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [requested, setRequested] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const attemptPlay = () => {
    const element = player.current
    if (!element) return
    element.muted = true
    element.defaultMuted = true
    element.playsInline = true
    // A browser rejection is not a user-requested pause. Leave retries enabled.
    void element.play().catch(() => {})
  }
  useImperativeHandle(playbackRef, () => ({
    start: () => { if (autoPlay && !paused && !document.hidden) attemptPlay() },
  }), [autoPlay, paused])

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

  const shouldPlay = playbackEnabled && !!video && (autoPlay || requested) && inView && visible && !paused && !failed
  useEffect(() => {
    const element = player.current
    if (!element) return
    if (!shouldPlay) { element.pause(); return }
    const retry = () => { if (element.paused) attemptPlay() }
    attemptPlay()
    // Touchend/pointerup can carry activation even when a wheel event does not.
    element.addEventListener('canplay', retry)
    window.addEventListener('pointerup', retry)
    window.addEventListener('touchend', retry, { passive: true })
    window.addEventListener('keydown', retry)
    return () => {
      element.removeEventListener('canplay', retry)
      window.removeEventListener('pointerup', retry)
      window.removeEventListener('touchend', retry)
      window.removeEventListener('keydown', retry)
      element.pause()
    }
  }, [shouldPlay])

  return <div ref={container} className="scene-media" style={{ '--media-position': position } as CSSProperties}>
    <picture>
      {imageMobile && <source media="(max-width: 700px)" srcSet={imageMobile} />}
      <img src={image} alt={alt} width="1920" height="1080" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    </picture>
    {video && <video ref={player} src={video} muted loop playsInline autoPlay={shouldPlay} preload="none" aria-hidden="true"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false) }}
      className={playing ? 'is-playing' : ''} />}
    <div className="scene-shade" />
    <div className="media-credit">
      <span>{credit}</span>
      {video && <button className="video-toggle" type="button"
        aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        title={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        onClick={() => {
          if (playing) { setPaused(true); player.current?.pause(); return }
          setRequested(true); setPaused(false)
          if (failed) { setFailed(false); player.current?.load() }
          if (playbackEnabled) attemptPlay()
        }}>
        {playing ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" /></svg>}
      </button>}
    </div>
  </div>
})
