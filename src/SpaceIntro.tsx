import { useEffect, useRef, type ReactNode } from 'react'
import './SpaceIntro.css'
import { createConstellationMap } from './introConstellations'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
export default function SpaceIntro({ children, onStart, onComplete }: { children: ReactNode; onStart: () => void; onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current!
    const canvas = el.querySelector<HTMLCanvasElement>('.star-canvas')!
    const constellationCanvas = el.querySelector<HTMLCanvasElement>('.constellation-canvas')!
    const constellationContext = constellationCanvas.getContext('2d')!
    let constellationMap: HTMLCanvasElement | null = null
    let illumination = 0
    const ctx = canvas.getContext('2d')!
    const logo = el.querySelector<HTMLElement>('.cover-wordmark')!
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.cover-letter'))
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = innerWidth, h = innerHeight, frame = 0, previous = 0, progress = 0
    let px = w / 2, py = h / 2, tx = px, ty = py, active = false
    let tiltX = 0, tiltY = 0
    let startedAt: number | null = null
    let complete = window.scrollY > 20 || Boolean(location.hash && location.hash !== '#inicio')
    let touchY = 0
    let drag: { id: number; x: number; y: number } | null = null
    let notified = false
    const duration = reduced ? 200 : 3400
    const start = () => {
      if (!complete && startedAt === null) {
        startedAt = performance.now()
        onStart()
      }
    }
    const wheel = (event: WheelEvent) => {
      if (complete || event.ctrlKey) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (event.deltaY > 2) start()
    }
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0 }
    const touchMove = (event: TouchEvent) => {
      if (complete || event.touches.length !== 1) return
      if (event.cancelable) event.preventDefault()
      if (touchY - event.touches[0].clientY > 18) start()
    }
    const keyDown = (event: KeyboardEvent) => {
      if (complete || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (['ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); start() }
    }
    const onScroll = () => {
      if (complete || window.scrollY <= 20) return
      // Explicit section links may bypass the intro, but a gesture must not
      // shorten an opening already in progress (including native touch inertia).
      if (startedAt === null && location.hash && location.hash !== '#inicio') {
        complete = true
        return
      }
      start()
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('wheel', wheel, { passive: false, capture: true })
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: false })
    window.addEventListener('keydown', keyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    let dust: { x:number,y:number,seed:number }[] = []
    const stars = Array.from({length: 95}, () => ({x:Math.random(),y:Math.random(),phase:Math.random()*6.28,r:Math.random()*.9+.3}))
    const sample = () => {
      const off = document.createElement('canvas'); off.width = w; off.height = h
      const c = off.getContext('2d')!
      letters.forEach(letter => {
        const box = letter.getBoundingClientRect(), style = getComputedStyle(letter)
        c.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        c.textBaseline = 'middle'; c.fillStyle = '#fff'
        c.fillText(letter.textContent!, box.left + parseFloat(style.paddingLeft), box.top + box.height / 2)
      })
      const data = c.getImageData(0,0,w,h).data
      dust = []
      for(let y=0;y<h;y+=5) for(let x=0;x<w;x+=5) if(data[(y*w+x)*4+3]>100) dust.push({x,y,seed:Math.random()})
    }
    const resize = () => {
      w=innerWidth; h=innerHeight
      const dpr = Math.min(devicePixelRatio,1.5)
      canvas.width=w*dpr; canvas.height=h*dpr
      ctx.setTransform(dpr,0,0,dpr,0,0)
      constellationCanvas.width = canvas.width
      constellationCanvas.height = canvas.height
      constellationContext.setTransform(dpr,0,0,dpr,0,0)
      constellationMap = createConstellationMap(w,h,dpr)
      sample()
    }
    const move = (e: PointerEvent) => {
      tx=e.clientX; ty=e.clientY; active=true
      if (!complete && drag?.id === e.pointerId) {
        const up = drag.y - e.clientY
        if (up > 24 && up > Math.abs(e.clientX - drag.x)) start()
      }
    }
    const press = (e: PointerEvent) => {
      move(e)
      const overlay = el.querySelector<HTMLElement>('.intro-overlay')!
      if (complete || e.button !== 0 || e.pointerType === 'touch' || !overlay.contains(e.target as Node)) return
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY }
      overlay.setPointerCapture(e.pointerId)
      el.dataset.dragging = 'true'
    }
    const release = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') active = false
      if (drag?.id === e.pointerId) { drag = null; delete el.dataset.dragging }
    }
    const leave = () => { active=false; tx=w/2;ty=h/2 }
    const draw = (time:number) => {
      const dt = Math.min(50,time-previous || 16); previous=time
      const ease = 1-Math.exp(-dt/130)

      const elapsed = startedAt === null ? 0 : clamp((time - startedAt) / duration)
      progress = complete ? 1 : elapsed * elapsed * (3 - 2 * elapsed)
      if (elapsed >= 1) complete = true
      if (complete && !notified) { notified = true; onComplete() }
      el.dataset.state = complete ? 'complete' : startedAt === null ? 'waiting' : 'opening'
      el.style.setProperty('--curtain-y', `${reduced ? 0 : -progress * 105}%`)
      px+=(tx-px)*ease;py+=(ty-py)*ease
      const idle = reduced?0:Math.sin(time*.00065)
      tiltX+=((active?-(py/h-.5)*12:idle*1.8)-tiltX)*ease
      tiltY+=((active?(px/w-.5)*20:Math.cos(time*.0005)*2.5)-tiltY)*ease
      el.style.setProperty('--pointer-x',`${px}px`);el.style.setProperty('--pointer-y',`${py}px`)
      el.style.setProperty('--veil',`${1-clamp((progress-.12)/.83)}`)
      el.style.setProperty('--cue-opacity',`${1-clamp(progress*4)}`)
      el.style.setProperty('--image-scale',`${1.12-progress*.12}`)
      el.style.setProperty('--copy-opacity',`${clamp((progress-.55)/.4)}`)
      el.style.setProperty('--copy-y',`${(1-clamp((progress-.5)/.5))*55}px`)
      logo.style.transform=`perspective(800px) rotateX(${reduced?0:tiltX}deg) rotateY(${reduced?0:tiltY}deg) translateY(${reduced?0:idle*4-progress*110}px)`
      letters.forEach((letter,i)=>{
        const p=clamp((progress-.08-i*.035)/.56)
        letter.style.opacity=`${1-p}`
        letter.style.filter=`blur(${reduced ? 0 : p*p*17}px)`
        // A small elastic warp follows the same eased pointer as the overall tilt.
        const position = (i - 2.5) / 2.5
        const warp = reduced ? 0 : (tiltY / 10) * (1 - p)
        const bend = reduced ? 0 : (tiltX / 6) * (1 - p)
        letter.style.transform=`translate3d(${(i-2.5)*p*8}px,${-p*p*(35+i*7) + warp*position*2}px,0) skewY(${warp*position*1.8}deg) skewX(${bend*1.2}deg) scale(${1+p*.12+warp*position*.012},${1+p*.12-bend*position*.012})`
        letter.style.maskImage=p > 0 ? `linear-gradient(to top, transparent ${p*115-15}%, black ${p*115+12}%)` : 'none'
      })
      const hero = el.querySelector<HTMLElement>('.intro-content')!
      hero.inert = progress < .8
      el.querySelector<HTMLElement>('.intro-overlay')!.inert = progress > .96
      // The constellation layer sits behind the wordmark; reveal only the lit area.
      illumination += ((active ? 1 : 0) - illumination) * (1 - Math.exp(-dt / 240))
      constellationContext.clearRect(0,0,w,h)
      if (constellationMap && illumination > .002 && progress < 1) {
        constellationContext.globalCompositeOperation = 'source-over'
        constellationContext.globalAlpha = illumination * (1-progress)
        constellationContext.drawImage(constellationMap,0,0,w,h)
        constellationContext.globalAlpha = 1
        constellationContext.globalCompositeOperation = 'destination-in'
        const light = constellationContext.createRadialGradient(px,py,0,px,py,260)
        light.addColorStop(0,'rgba(255,255,255,1)')
        light.addColorStop(.35,'rgba(255,255,255,.85)')
        light.addColorStop(1,'rgba(255,255,255,0)')
        constellationContext.fillStyle = light
        constellationContext.fillRect(0,0,w,h)
        constellationContext.globalCompositeOperation = 'source-over'
      }
      ctx.clearRect(0,0,w,h)
      if(progress<1) {
        for(const s of stars) {
          const drift=reduced?0:time*.0018
          const x=(s.x*w+drift*s.r)%w+(px-w/2)*.012*s.r
          const y=s.y*h+Math.sin(time*.0005+s.phase)*5
          ctx.globalAlpha=(.3+Math.sin(time*.001+s.phase)*.16)*(1-progress)
          ctx.fillStyle='#cbd9eb';ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill()
        }
        if(!reduced && progress>.08 && progress<.92) for(const d of dust) {
          const p=clamp((progress-.1-d.seed*.16)/.62)
          ctx.globalAlpha=Math.sin(p*Math.PI)*.5
          ctx.fillStyle='#e4ecf7'
          ctx.fillRect(d.x+(d.seed-.5)*p*180,d.y-p*p*(90+d.seed*170),1.2,1.2)
        }
      }
      ctx.globalAlpha=1
      if (!complete) frame=requestAnimationFrame(draw)
    }
    let disposed = false
    resize(); document.fonts.ready.then(() => { if (!disposed) sample() })
    frame=requestAnimationFrame(draw)
    window.addEventListener('resize',resize)
    window.addEventListener('pointermove',move,{passive:true})
    window.addEventListener('pointerdown',press,{passive:true})
    window.addEventListener('pointerup',release,{passive:true})
    window.addEventListener('pointercancel',release,{passive:true})
    document.documentElement.addEventListener('pointerleave',leave)
    const skip = (e:Event) => { e.preventDefault(); start() }
    const links=el.querySelectorAll('[data-skip-cover]');links.forEach(l=>l.addEventListener('click',skip))
    return ()=>{window.removeEventListener('pointerdown',press);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('wheel',wheel,true);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);window.removeEventListener('keydown',keyDown);window.removeEventListener('scroll',onScroll);disposed = true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);links.forEach(l=>l.removeEventListener('click',skip))}
  },[onStart, onComplete])
  return <div ref={root} className="space-intro cover-track">
    <div className="intro-stage">
      <div className="intro-content">{children}</div>
      <div className="intro-overlay">
        <div className="curtain-black"/><div className="cursor-light" aria-hidden="true"/>
        <canvas className="constellation-canvas" aria-hidden="true"/>
        <canvas className="star-canvas" aria-hidden="true"/>
        <div className="cover-wordmark" aria-label="SpaceX">{[...'SpaceX'].map((l,i)=><span key={i} className="cover-letter" aria-hidden="true">{l}</span>)}</div>
        <a className="intro-scroll-cue" href="#inicio" data-skip-cover><span>Arraste para cima<span className="intro-desktop-hint"> ou role</span></span><i/></a>
      </div>
    </div>
  </div>
}
