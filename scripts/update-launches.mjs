import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const target = new URL('../public/data/launches.json', import.meta.url)
const base = 'https://ll.thespacedevs.com/2.3.0/launches/'
export function normalizeLaunch(l) {
  if (l.launch_service_provider?.id !== 121 || typeof l.id !== 'string' ||
      typeof l.name !== 'string' || typeof l.status?.id !== 'number') {
    throw new Error('Resposta inválida ou agência diferente de SpaceX')
  }
  const net = l.net && Number.isFinite(Date.parse(l.net)) ? l.net : null
  return {
    id: l.id, name: l.mission?.name || l.name, net, statusId: l.status.id,
    precise: l.net_precision?.name === 'Minute' || l.net_precision?.name === 'Second',
    vehicle: l.rocket?.configuration?.full_name || 'Veículo a confirmar',
    location: [l.pad?.name, l.pad?.location?.name].filter(Boolean).join(', ') || 'Local a confirmar',
  }
}
async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'CampsTech-SpaceX-school-project/1.0' } })
  if (!response.ok) throw new Error(`API: HTTP ${response.status}`)
  return response.json()
}
export async function updateLaunches() {
  let snapshot
  try {
    const results = []
    for (const endpoint of ['upcoming', 'previous']) {
      const data = await getJson(`${base}${endpoint}/?lsp__id=121&limit=15&mode=normal`)
      if (!Array.isArray(data.results) || data.results.length === 0) throw new Error('API sem lançamentos')
      results.push(...data.results.map(normalizeLaunch))
    }
    snapshot = { fetchedAt: new Date().toISOString(), launches: [...new Map(results.map(l => [l.id, l])).values()] }
  } catch (error) {
    console.warn(`Não foi possível atualizar: ${error.message}. Preservando a última consulta.`)
    const backups = []
    try { backups.push(await getJson('https://rafaelsilvapythondev.github.io/Camps_Tech_SpaceX/data/launches.json')) } catch {}
    try { backups.push(JSON.parse(await readFile(target, 'utf8'))) } catch {}
    snapshot = backups.filter(s => Number.isFinite(Date.parse(s?.fetchedAt)) && Array.isArray(s.launches) && s.launches.length)
      .sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt))[0]
    if (!snapshot) throw error
  }
  await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
  await writeFile(target, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`${snapshot.launches.length} lançamentos; consulta: ${snapshot.fetchedAt}`)
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await updateLaunches()
}
