import { useEffect, useRef, type ReactNode } from 'react'
import './SpaceIntro.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
export default function SpaceIntro({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current!
    const canvas = el.querySelector('canvas')!
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
    const duration = reduced ? 200 : 2600
    const start = () => { if (!complete && startedAt === null) startedAt = performance.now() }
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
    const onScroll = () => { if (window.scrollY > 20) complete = true }
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
        c.fillText(letter.textContent!, box.left, box.top + box.height / 2)
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
      sample()
    }
    const move = (e: PointerEvent) => { tx=e.clientX; ty=e.clientY; active=true }
    const leave = () => { active=false; tx=w/2;ty=h/2 }
    const draw = (time:number) => {
      const dt = Math.min(50,time-previous || 16); previous=time
      const ease = 1-Math.exp(-dt/130)

      const elapsed = startedAt === null ? 0 : clamp((time - startedAt) / duration)
      progress = complete ? 1 : elapsed * elapsed * (3 - 2 * elapsed)
      if (elapsed >= 1) complete = true
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
        letter.style.transform=`translate3d(${(i-2.5)*p*8}px,${-p*p*(35+i*7)}px,0) scale(${1+p*.12})`
        letter.style.maskImage=`linear-gradient(to top, transparent ${p*115-15}%, black ${p*115+12}%)`
      })
      const hero = el.querySelector<HTMLElement>('.intro-content')!
      hero.inert = progress < .8
      el.querySelector<HTMLElement>('.intro-overlay')!.inert = progress > .96
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
    document.documentElement.addEventListener('pointerleave',leave)
    const skip = (e:Event) => { e.preventDefault(); start() }
    const links=el.querySelectorAll('[data-skip-cover]');links.forEach(l=>l.addEventListener('click',skip))
    return ()=>{window.removeEventListener('wheel',wheel,true);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);window.removeEventListener('keydown',keyDown);window.removeEventListener('scroll',onScroll);disposed = true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);links.forEach(l=>l.removeEventListener('click',skip))}
  },[])
  return <div ref={root} className="space-intro cover-track">
    <div className="intro-stage">
      <div className="intro-content">{children}</div>
      <div className="intro-overlay">
        <div className="curtain-black"/><div className="cursor-light" aria-hidden="true"/>
        <canvas className="star-canvas" aria-hidden="true"/>
        <a className="skip-cover" href="#inicio" data-skip-cover>Pular abertura</a>
        <div className="cover-wordmark" aria-label="SpaceX">{[...'SpaceX'].map((l,i)=><span key={i} className="cover-letter" aria-hidden="true">{l}</span>)}</div>
        <a className="intro-scroll-cue" href="#inicio" data-skip-cover><span>Arraste para cima</span><i/></a>
      </div>
    </div>
  </div>
}
