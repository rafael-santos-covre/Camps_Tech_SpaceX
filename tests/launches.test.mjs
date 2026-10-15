import test from 'node:test'
import assert from 'node:assert/strict'
import { launchStatus, canCountDown, orderLaunches, validSnapshot, missionFromLaunch, countdownAt } from '../src/launches.ts'
import { normalizeLaunch } from '../scripts/update-launches.mjs'

const now = Date.parse('2026-10-15T12:00:00Z')
const launch = { id: 'test', name: 'Mission', net: '2026-10-15T13:00:00Z', statusId: 1, precise: true, vehicle: 'Falcon 9', location: 'Cape Canaveral' }
test('shared clock advances seconds, rolls minutes over and catches up after sleep', () => {
  const target = now + 61_000
  assert.deepEqual(countdownAt(target, now), { days: 0, hours: 0, minutes: 1, seconds: 1, expired: false })
  assert.equal(countdownAt(target, now + 1000).seconds, 0)
  assert.equal(countdownAt(target, now + 2000).seconds, 59)
  assert.equal(countdownAt(target, now + 2000).minutes, 0)
  assert.equal(countdownAt(target, now + 50_000).seconds, 11)
  assert.equal(countdownAt(target, target).expired, true)
  assert.equal(countdownAt(target, target + 10_000).seconds, 0)
})
test('new schedule and hold replace a running countdown without reloading', () => {
  assert.equal(countdownAt(Date.parse(launch.net), now).hours, 1)
  const postponed = { ...launch, net: '2026-10-15T14:00:00Z' }
  assert.equal(countdownAt(Date.parse(postponed.net), now).hours, 2)
  assert.equal(missionFromLaunch({ ...postponed, statusId: 5 }, now).countdown, false)
  assert.equal(missionFromLaunch({ ...postponed, statusId: 5 }, now).status, 'Em espera')
})
test('expired scheduled launch is awaiting confirmation, never upcoming or success', () => {
  const expired = { ...launch, net: '2026-10-15T11:00:00Z' }
  assert.equal(launchStatus(expired, now), 'Aguardando atualização')
  assert.equal(canCountDown(expired, now), false)
  assert.equal(launchStatus(launch, Date.parse(launch.net)), 'Aguardando atualização')
})
test('provider outcomes and hold are respected', () => {
  for (const [statusId, label] of [[3, 'Sucesso'], [4, 'Falha'], [5, 'Em espera'], [6, 'Em voo'], [7, 'Falha parcial'], [9, 'Carga implantada']]) {
    const l = { ...launch, statusId }
    assert.equal(launchStatus(l, now), label)
    assert.equal(canCountDown(l, now), false)
  }
})
test('countdown requires confirmed precise future time', () => {
  assert.equal(canCountDown(launch, now), true)
  for (const patch of [{ precise: false }, { net: null }, { statusId: 2 }, { statusId: 8 }]) {
    assert.equal(canCountDown({ ...launch, ...patch }, now), false)
  }
  assert.equal(missionFromLaunch({ ...launch, statusId: 2 }, now).date, 'Data a definir')
})
test('nearest future launch is sorted first and past outcomes are newest first', () => {
  const later = { ...launch, id: 'later', net: '2026-10-17T13:00:00Z' }
  const past = { ...launch, id: 'past', statusId: 3, net: '2026-10-14T13:00:00Z' }
  const older = { ...past, id: 'older', net: '2026-10-12T13:00:00Z' }
  assert.deepEqual(orderLaunches([older, later, past, launch], now).map(l => l.id), ['test', 'later', 'past', 'older'])
})
test('malformed snapshots are rejected and empty valid results are accepted', () => {
  assert.equal(validSnapshot({ fetchedAt: 'broken', launches: [] }), false)
  assert.equal(validSnapshot({ fetchedAt: new Date(now).toISOString(), launches: [{ ...launch, net: 'bad' }] }), false)
  assert.equal(validSnapshot({ fetchedAt: new Date(now).toISOString(), launches: [] }), true)
})
test('normalizer rejects wrong agency and handles missing dates', () => {
  const raw = { id: 'id', name: 'Falcon | Mission', launch_service_provider: { id: 121 }, status: { id: 8 }, net: null }
  assert.equal(normalizeLaunch(raw).net, null)
  assert.equal(normalizeLaunch(raw).precise, false)
  assert.throws(() => normalizeLaunch({ ...raw, launch_service_provider: { id: 1 } }))
})
