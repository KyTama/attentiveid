import { describe, expect, it } from 'bun:test'
import type { FreeSessionRecord } from '@attentiveid/shared'
import { alignFreeSessionRow, appendFreeSessionRecords, sheetRowId, toJakartaIso } from './free-session-sheet'
import { createFreeSessionSheetSync } from './free-session-sheet-sync'

const record = (overrides: Partial<FreeSessionRecord> = {}): FreeSessionRecord => ({
  id: '9859e91a-e3c0-4a11-8bbb-000000000001',
  createdAt: '2026-10-01T02:13:09.000Z',
  name: 'Ervina Rahayu',
  age: 29,
  gender: 'perempuan',
  phone: '87880406066',
  email: 'ervina@example.com',
  keluhan: 'hubungan',
  keluhanDetail: '=HYPERLINK("http://evil")',
  ...overrides,
})

// Headers exactly as the live sheet has them (columns K-N come from the old form).
const HEADERS = ['ID', 'Timestamp', 'Nama', 'Umur', 'Jenis Kelamin', 'Nomor WhatsApp', 'Email', 'Keluhan (kode)', 'Keluhan (label)', 'Ceritakan lebih lanjut', 'Setuju dihubungi', 'IP', 'Pekerjaan', 'Kota']

describe('free session sheet rows', () => {
  it('formats the id and the Jakarta timestamp like the existing rows', () => {
    expect(sheetRowId('9859e91a-e3c0-4a11-8bbb-000000000001')).toBe('9859e91ae3c0')
    expect(toJakartaIso('2026-10-01T02:13:09.000Z')).toBe('2026-10-01T09:13:09+07:00')
  })

  it('fills the sheet columns in the sheet order, leaves columns the form does not collect empty, and neutralises formulas', () => {
    const row = alignFreeSessionRow(HEADERS, record())
    expect(row.slice(0, 9)).toEqual(['9859e91ae3c0', '2026-10-01T09:13:09+07:00', 'Ervina Rahayu', '29', 'Perempuan', '87880406066', 'ervina@example.com', 'hubungan', 'Masalah hubungan / keluarga'])
    expect(row[9]).toBe("'=HYPERLINK(\"http://evil\")")
    expect(row.slice(10)).toEqual(['Ya', '', '', ''])
  })

  it('follows a re-ordered or truncated header row', () => {
    const row = alignFreeSessionRow(['Nama', 'Setuju dihub', 'ID'], record())
    expect(row).toEqual(['Ervina Rahayu', 'Ya', '9859e91ae3c0'])
  })
})

const config = { google: { clientId: 'c', clientSecret: 's', refreshToken: 'r-1234567890', spreadsheetId: 'sheet-1' }, spreadsheetId: 'sheet-1', sheetName: 'Sheet1' }

const fakeGoogle = (existingIds: string[] = []) => {
  const calls: Array<{ url: string; method: string; body?: any }> = []
  const fetchFn = async (url: string, init: RequestInit) => {
    const method = String(init.method ?? 'GET')
    calls.push({ url, method, body: typeof init.body === 'string' && init.body.startsWith('{') ? JSON.parse(init.body) : undefined })
    const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } })
    if (url.includes('oauth2.googleapis.com')) return json({ access_token: 'tok', expires_in: 3600 })
    if (url.includes('A1%3AAZ1') || url.includes('A1:AZ1')) return json({ values: [HEADERS] })
    if (url.includes('A2%3AA') || url.includes('A2:A')) return json({ values: existingIds.map((id) => [id]) })
    if (url.includes(':append')) return json({ updates: { updatedRows: 1 } })
    return new Response('nope', { status: 404 })
  }
  return { fetchFn, calls }
}

describe('appendFreeSessionRecords', () => {
  it('appends new rows (oldest first), never touches the header, and skips ids already in the sheet', async () => {
    const { fetchFn, calls } = fakeGoogle(['9859e91ae3c0'])
    const older = record({ id: 'aaaaaaaa-0000-4000-8000-000000000002', createdAt: '2026-10-01T01:00:00.000Z', name: 'Older' })
    const newer = record({ id: 'bbbbbbbb-0000-4000-8000-000000000003', createdAt: '2026-10-01T05:00:00.000Z', name: 'Newer' })
    const done = await appendFreeSessionRecords(config, [newer, record(), older], fetchFn)
    expect(done.sort()).toEqual([record().id, newer.id, older.id].sort())
    const append = calls.find((call) => call.url.includes(':append'))!
    expect(append.method).toBe('POST')
    expect(append.body.values.map((row: string[]) => row[2])).toEqual(['Older', 'Newer'])
    expect(calls.some((call) => call.method === 'PUT')).toBe(false)
  })

  it('refuses a sheet whose header row is not recognised', async () => {
    const fetchFn = async (url: string) =>
      url.includes('oauth2')
        ? new Response(JSON.stringify({ access_token: 't2', expires_in: 3600 }))
        : new Response(JSON.stringify({ values: [['Foo', 'Bar']] }))
    await expect(appendFreeSessionRecords({ ...config, google: { ...config.google, refreshToken: 'other-token-0000' } }, [record()], fetchFn as any)).rejects.toThrow('header row not recognised')
  })
})

describe('createFreeSessionSheetSync', () => {
  const memoryRepository = (rows: FreeSessionRecord[]) => {
    const synced = new Set<string>()
    const failed = new Map<string, string>()
    return {
      synced,
      failed,
      repository: {
        create: async () => ({ id: 'x' }),
        listAll: async () => rows,
        listUnsynced: async () => rows.filter((row) => !synced.has(row.id)),
        markSynced: async (ids: string[]) => ids.forEach((id) => { synced.add(id); failed.delete(id) }),
        markFailed: async (ids: string[], error: string) => ids.forEach((id) => failed.set(id, error)),
        sheetStatus: async () => ({ pending: rows.filter((row) => !synced.has(row.id)).length, failed: failed.size }),
      },
    }
  }

  it('marks rows synced on success and keeps them pending (with the error) when Google fails, then retries', async () => {
    const memory = memoryRepository([record()])
    let fail = true
    const { fetchFn } = fakeGoogle()
    const flaky = async (url: string, init: RequestInit) => (fail && url.includes(':append') ? new Response('boom', { status: 500 }) : fetchFn(url, init))
    const sync = createFreeSessionSheetSync({ repository: memory.repository as any, config, fetchFn: flaky as any })

    const first = await sync.syncPending()
    expect(first).toMatchObject({ configured: true, synced: 0, pending: 1, failed: 1 })
    expect(first.error).toContain('append failed')

    fail = false
    const second = await sync.syncPending()
    expect(second).toMatchObject({ synced: 1, pending: 0, failed: 0, error: null })
  })

  it('reports not configured without calling Google when credentials are missing', async () => {
    const memory = memoryRepository([record()])
    const sync = createFreeSessionSheetSync({ repository: memory.repository as any })
    const result = await sync.syncPending()
    expect(result).toMatchObject({ configured: false, synced: 0, pending: 1 })
    expect((await sync.status()).spreadsheetUrl).toBeNull()
  })
})
