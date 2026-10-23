export interface Launch {
  id: string
  name: string
  net: string | null
  statusId: number
  precise: boolean
  vehicle: string
  location: string
}
// Derive every countdown from the same clock; never start a timer per render.
export function countdownAt(target: number, now: number) {
  const remaining = Math.max(0, Math.ceil((target - now) / 1000))
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    expired: target <= now,
  }
}
export interface LaunchSnapshot {
  fetchedAt: string
  launches: Launch[]
  stats?: { totalLaunches: number; totalLandings: number; totalReflights: number }
}
export function validSnapshot(value: unknown): value is LaunchSnapshot {
  const v = value as LaunchSnapshot | null
  return !!v && Number.isFinite(Date.parse(v.fetchedAt)) && Array.isArray(v.launches) &&
    v.launches.every(l => l && typeof l.id === 'string' && typeof l.name === 'string' &&
      typeof l.statusId === 'number' && typeof l.precise === 'boolean' &&
      typeof l.vehicle === 'string' && typeof l.location === 'string' &&
      (l.net === null || (typeof l.net === 'string' && Number.isFinite(Date.parse(l.net))))) &&
    (v.stats === undefined || ['totalLaunches', 'totalLandings', 'totalReflights'].every(k => {
      const n = v.stats?.[k as keyof NonNullable<LaunchSnapshot['stats']>]
      return Number.isFinite(n) && Number(n) >= 0
    }))
}
export function launchStatus(l: Launch, now: number): string {
  const confirmed: Record<number, string> = {
    3: 'Sucesso', 4: 'Falha', 5: 'Em espera', 6: 'Em voo',
    7: 'Falha parcial', 9: 'Carga implantada',
  }
  if (confirmed[l.statusId]) return confirmed[l.statusId]
  if (l.net && Date.parse(l.net) <= now) return 'Aguardando atualização'
  if (l.statusId === 2 || !l.net) return 'Data a definir'
  if (l.statusId === 8) return 'A confirmar'
  return l.statusId === 1 ? 'Programado' : 'Status a confirmar'
}
export function canCountDown(l: Launch, now: number): boolean {
  return l.statusId === 1 && l.precise && !!l.net && Date.parse(l.net) > now
}
export function orderLaunches(launches: Launch[], now: number): Launch[] {
  const group = (l: Launch) => {
    if ([1, 2, 8].includes(l.statusId) && l.net && Date.parse(l.net) > now) return 0
    if ([3, 4, 7, 9].includes(l.statusId)) return 2
    return 1
  }
  return [...launches].sort((a, b) => group(a) - group(b) ||
    (group(a) === 0 ? Date.parse(a.net!) - Date.parse(b.net!) :
      (Date.parse(b.net ?? '') || 0) - (Date.parse(a.net ?? '') || 0)))
}
export function missionFromLaunch(l: Launch, now: number) {
  const launchAt = l.net ? new Date(l.net) : null
  const date = !launchAt || l.statusId === 2 ? 'Data a definir' :
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(launchAt)
  return { ...l, date, launchAt, status: launchStatus(l, now), countdown: canCountDown(l, now) }
}
