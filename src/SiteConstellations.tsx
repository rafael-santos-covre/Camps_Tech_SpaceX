import { useEffect } from 'react'
import { createConstellationMap } from './introConstellations'

// Background-only canvases: photographic scenes never receive this layer.
export default function SiteConstellations() {
  useEffect(() => {
    const surfaces = Array.from(document.querySelectorAll<HTMLElement>('.reading-section, .stats-strip, .sources-section, .site-footer, .launch-list'))
    const layers = surfaces.map(surface => {
      const canvas = document.createElement('canvas')
      canvas.className = 'site-constellation-canvas'
      canvas.setAttribute('aria-hidden', 'true')
      surface.classList.add('constellation-surface')
      surface.prepend(canvas)
      return { surface, canvas, ctx: canvas.getContext('2d')!, visible: false }
    })
    let frame = 0, last = 0, x = -1000, y = -1000, targetX = x, targetY = y, opacity = 0, active = false
    let map: HTMLCanvasElement | null = null, mapWidth = 0, tileHeight = 0
    const ratio = Math.min(devicePixelRatio || 1, 1.5)
    const render = (time: number) => {
      frame = 0
      const dt = Math.min(50, time-last || 16); last = time
      const ease = 1-Math.exp(-dt/140)
      x += (targetX-x)*ease; y += (targetY-y)*ease
      opacity += ((active ? 1 : 0)-opacity)*ease
      for (const layer of layers) {
        if (!layer.visible) continue
        const { surface, canvas, ctx } = layer
        const box = surface.getBoundingClientRect()
        const width = surface.offsetWidth, height = surface.offsetHeight
        if (!width || !height) continue
        // Only allocate the visible viewport-sized portion, even for long text sections.
        const top = Math.max(0, -box.top)
        const visibleHeight = Math.max(0, Math.min(height-top, innerHeight))
        const cw = Math.round(width*ratio), ch = Math.round(visibleHeight*ratio)
        if (canvas.width !== cw || canvas.height !== ch) { canvas.width=cw; canvas.height=ch }
        canvas.style.top = `${top}px`
        canvas.style.height = `${visibleHeight}px`
        ctx.setTransform(ratio,0,0,ratio,0,0)
        ctx.clearRect(0,0,width,visibleHeight)
        if (!map) continue
        const localX=x-box.left, localY=y-box.top-top
        ctx.globalCompositeOperation='source-over'
        ctx.globalAlpha=.95
        const offset=top%tileHeight
        for(let at=-offset;at<visibleHeight;at+=tileHeight) ctx.drawImage(map,0,at,mapWidth,tileHeight)
        ctx.globalAlpha=1
        ctx.globalCompositeOperation='destination-in'
        const mask=ctx.createRadialGradient(localX,localY,0,localX,localY,260)
        // A quiet baseline remains visible without a mouse; the cursor adds emphasis.
        mask.addColorStop(0,`rgba(255,255,255,${.38+.62*opacity})`)
        mask.addColorStop(.35,`rgba(255,255,255,${.38+.47*opacity})`)
        mask.addColorStop(1,'rgba(255,255,255,.38)')
        ctx.fillStyle=mask;ctx.fillRect(0,0,width,visibleHeight)
        ctx.globalCompositeOperation='destination-over'
        const light=ctx.createRadialGradient(localX,localY,0,localX,localY,300)
        light.addColorStop(0,`rgba(24,46,78,${opacity*.45})`);light.addColorStop(1,'rgba(16,36,64,0)')
        ctx.fillStyle=light;ctx.fillRect(0,0,width,visibleHeight)
        ctx.globalCompositeOperation='source-over'
        // Also protect embedded media added inside otherwise textual sections.
        surface.querySelectorAll<HTMLElement>('img, video, iframe, canvas:not(.site-constellation-canvas), .simulator-panel').forEach(media => {
          const rect=media.getBoundingClientRect()
          ctx.clearRect(rect.left-box.left,rect.top-box.top-top,rect.width,rect.height)
        })
      }
      if (Math.abs(targetX-x)+Math.abs(targetY-y)>.3 || Math.abs((active?1:0)-opacity)>.003) schedule()
    }
    const schedule = () => { if (!frame && !document.hidden) frame=requestAnimationFrame(render) }
    const resize = () => {
      mapWidth=document.documentElement.clientWidth
      tileHeight=Math.max(500,Math.min(900,innerHeight))
      map=createConstellationMap(mapWidth,tileHeight,ratio)
      schedule()
    }
    const observer = new IntersectionObserver(entries => {
      for(const entry of entries) {
        const layer=layers.find(item=>item.surface===entry.target)
        if(layer) layer.visible=entry.isIntersecting
      }
      schedule()
    })
    layers.forEach(layer=>observer.observe(layer.surface))
    const sizeObserver=new ResizeObserver(schedule)
    surfaces.forEach(surface=>sizeObserver.observe(surface))
    const move=(event:PointerEvent)=>{targetX=event.clientX;targetY=event.clientY;active=true;schedule()}
    const leave=()=>{active=false;schedule()}
    const release=(event:PointerEvent)=>{if(event.pointerType!=='mouse')leave()}
    resize()
    window.addEventListener('pointermove',move,{passive:true})
    window.addEventListener('pointerdown',move,{passive:true})
    window.addEventListener('pointerup',release,{passive:true})
    window.addEventListener('pointercancel',release,{passive:true})
    window.addEventListener('scroll',schedule,{passive:true})
    window.addEventListener('resize',resize)
    document.documentElement.addEventListener('pointerleave',leave)
    document.addEventListener('visibilitychange',schedule)
    return ()=>{
      cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect()
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move)
      window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release)
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize)
      document.documentElement.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',schedule)
      layers.forEach(({canvas,surface})=>{canvas.remove();surface.classList.remove('constellation-surface')})
    }
  },[])
  return null
}
