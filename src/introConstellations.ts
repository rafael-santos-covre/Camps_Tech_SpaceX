// Stylized star patterns, positioned for the opening scene (not a sky map).
const patterns = [
  { center: [.2, .28], points: [[-.5,-.18],[-.25,.2],[0,-.22],[.25,.18],[.5,-.25]], edges: [[0,1],[1,2],[2,3],[3,4]] }, // Cassiopeia
  { center: [.78, .3], points: [[-.4,-.42],[.32,-.35],[-.16,0],[0,.04],[.16,.08],[-.36,.48],[.36,.42]], edges: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]] }, // Orion
  { center: [.24, .73], points: [[-.6,-.22],[-.37,-.12],[-.15,.08],[.1,.13],[.43,.06],[.38,.34],[.08,.38]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]] }, // Big Dipper
  { center: [.77, .76], points: [[0,-.5],[0,-.13],[-.4,.08],[.4,.08],[.03,.5]], edges: [[0,1],[1,4],[2,1],[1,3]] }, // Cygnus
  { center: [.51, .16], points: [[0,-.3],[-.2,0],[.22,-.04],[.02,.36]], edges: [[0,3],[1,2]] }, // Southern Cross
]

export function createConstellationMap(width: number, height: number, ratio: number) {
  const map = document.createElement('canvas')
  map.width = Math.round(width * ratio)
  map.height = Math.round(height * ratio)
  const ctx = map.getContext('2d')!
  ctx.scale(ratio, ratio)
  const size = Math.min(230, width * .36, height * .27)
  for (const pattern of patterns) {
    const points = pattern.points.map(([x,y]) => [pattern.center[0]*width+x*size, pattern.center[1]*height+y*size])
    ctx.strokeStyle = 'rgba(137,174,218,.45)'
    ctx.lineWidth = .8
    ctx.beginPath()
    for (const [a,b] of pattern.edges) {
      ctx.moveTo(points[a][0], points[a][1]); ctx.lineTo(points[b][0], points[b][1])
    }
    ctx.stroke()
    for (const [x,y] of points) {
      const glow = ctx.createRadialGradient(x,y,0,x,y,8)
      glow.addColorStop(0,'rgba(205,226,255,.65)'); glow.addColorStop(1,'rgba(120,167,224,0)')
      ctx.fillStyle = glow; ctx.fillRect(x-8,y-8,16,16)
      ctx.fillStyle = '#dceaff'; ctx.beginPath(); ctx.arc(x,y,1.35,0,Math.PI*2); ctx.fill()
    }
  }
  return map
}
