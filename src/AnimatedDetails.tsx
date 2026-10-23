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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const toggle = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    if (!open) {
      setOpen(true)
      setClosing(false)
    } else if (closing) {
      setClosing(false)
    } else {
      setClosing(true)
      const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520
      closeTimer.current = setTimeout(() => {
        setOpen(false)
        setClosing(false)
        closeTimer.current = null
      }, delay)
    }
  }

  return <details className={className} style={style} open={open} data-closing={closing || undefined}>
    <summary aria-controls={id} aria-expanded={open && !closing} onClick={toggle}>
      {summary}<span className="disclosure-mark" aria-hidden="true" />
    </summary>
    <div id={id} className="disclosure-panel" inert={!open || closing}>
      <div className="disclosure-panel-inner">{children}</div>
    </div>
  </details>
}
