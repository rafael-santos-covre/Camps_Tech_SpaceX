import { useEffect, useState } from 'react'
import { validSnapshot, type LaunchSnapshot } from './launches'

export function useLaunches() {
  const [snapshot, setSnapshot] = useState<LaunchSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    let alive = true
    let pending = false
    let controller: AbortController | undefined
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
          setSnapshot(previous => !previous || Date.parse(data.fetchedAt) >= Date.parse(previous.fetchedAt) ? data : previous)
          setError(false)
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
    void refresh()
    const poll = setInterval(() => { if (!document.hidden) void refresh() }, 5 * 60_000)
    const tick = setInterval(() => setNow(Date.now()), 1000)
    const visible = () => { if (!document.hidden) { setNow(Date.now()); void refresh() } }
    const online = () => { setNow(Date.now()); void refresh() }
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('online', online)
    return () => {
      alive = false; controller?.abort(); clearInterval(poll); clearInterval(tick)
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('online', online)
    }
  }, [])
  const stale = !!snapshot && now - Date.parse(snapshot.fetchedAt) > 2 * 60 * 60_000
  return { snapshot, loading, error, now, stale }
}
