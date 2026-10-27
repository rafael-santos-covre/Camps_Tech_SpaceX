import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  defaultOpen?: boolean
  summary: ReactNode
  style?: CSSProperties
}

/** Native disclosure semantics with a short, reversible panel expansion. */
export default function AnimatedDetails({ children, className = '', defaultOpen = false, summary, style }: Props) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [closing, setClosing] = useState(false)
  const [expanded, setExpanded] = useState(defaultOpen)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frame = useRef<number | null>(null)

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const toggle = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    if (!open) {
      setOpen(true)
      setClosing(false)
      frame.current = requestAnimationFrame(() => {
        frame.current = requestAnimationFrame(() => {
          setExpanded(true)
          frame.current = null
        })
      })
    } else if (closing) {
      setClosing(false)
      setExpanded(true)
    } else {
      setClosing(true)
      setExpanded(false)
      const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520
      closeTimer.current = setTimeout(() => {
        setOpen(false)
        setClosing(false)
        closeTimer.current = null
      }, delay)
    }
  }

  return <details className={className} style={style} open={open} data-expanded={expanded || undefined} data-closing={closing || undefined}>
    <summary aria-controls={id} aria-expanded={open && !closing} onClick={toggle}>
      {summary}<span className="disclosure-mark" aria-hidden="true" />
    </summary>
    <div id={id} className="disclosure-panel" inert={!open || closing}>
      <div className="disclosure-panel-inner">{children}</div>
    </div>
  </details>
}
