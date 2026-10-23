import { useEffect, useState } from 'react'
import { validSnapshot, type LaunchSnapshot } from './launches'

export function useLaunches() {
  const [snapshot, setSnapshot] = useState<LaunchSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [now, setNow] = useState(Date.now)
  const [snapshotRefreshedAt, setSnapshotRefreshedAt] = useState(Date.now)
  useEffect(() => {
    let alive = true
    let pending = false
    let controller: AbortController | undefined
    let statsController: AbortController | undefined
    const loadOfficialStats = () => {
      statsController?.abort()
      statsController = new AbortController()
      void Promise.all([
        fetch('https://content.spacex.com/api/spacex-website/falcon-nine-stats', { signal: statsController?.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() }),
        fetch('https://content.spacex.com/api/spacex-website/dragon-stats', { signal: statsController?.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() }),
      ]).then(([falcon, dragon]) => {
        const stats = { totalLaunches: Number(falcon.totalLaunches) + Number(dragon.totalLaunches), totalLandings: Number(falcon.totalLandings), totalReflights: Number(falcon.totalReflights) + Number(dragon.totalReflights) }
        if (alive && Object.values(stats).every(Number.isFinite)) setSnapshot(previous => previous ? { ...previous, stats } : { fetchedAt: new Date().toISOString(), launches: [], stats })
      }).catch(() => {})
    }
    loadOfficialStats()
    const statsPoll = setInterval(loadOfficialStats, 30 * 60_000)
    async function refresh() {
      if (pending) return
      pending = true
      controller = new AbortController()
      const timeout = setTimeout(() => controller?.abort(), 15000)
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/launches.json?t=${Date.now()}`, {
          cache: 'no-store', signal: controller.signal,
        })
        if (!response.ok) throw new Error('Dados indisponíveis')
        const data: unknown = await response.json()
        if (!validSnapshot(data)) throw new Error('Dados inválidos')
        if (alive) {
          setSnapshot(previous => previous?.stats ? { ...data, stats: previous.stats } : !previous || Date.parse(data.fetchedAt) >= Date.parse(previous.fetchedAt) ? data : previous)
          setError(false)
          setSnapshotRefreshedAt(Date.now())
          setNow(Date.now())
        }
      } catch {
        if (alive) setError(true)
      } finally {
        clearTimeout(timeout)
        pending = false
        if (alive) setLoading(false)
      }
    }
    const launchPoll = setInterval(() => { if (!document.hidden) void refresh() }, 5 * 60_000)
    void refresh()
    const tick = setInterval(() => setNow(Date.now()), 1000)
    const visible = () => { if (!document.hidden) { setNow(Date.now()); void refresh() } }
    const online = () => { setNow(Date.now()); void refresh() }
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('online', online)
    return () => {
      alive = false; controller?.abort(); statsController?.abort(); clearInterval(launchPoll); clearInterval(tick); clearInterval(statsPoll)
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('online', online)
    }
  }, [])
  const stale = !!snapshot && now - snapshotRefreshedAt > 2 * 60 * 60_000
  return { snapshot, loading, error, now, stale }
}
