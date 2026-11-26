import { describe, expect, test } from 'bun:test'
import { columnName, createDriveReports, jakartaYearMonth } from './drive-reports'

interface Call { method: string; url: string; body?: string }

/** A tiny fake Drive: folders and files by (parent, name). */
const fakeDrive = (existing: { folders?: Record<string, string>; files?: Record<string, string> } = {}) => {
    const calls: Call[] = []
    const folders = new Map(Object.entries(existing.folders ?? {})) // "parent|name" -> id
    const files = new Map(Object.entries(existing.files ?? {}))
    let next = 1
    const fetchImpl = async (url: string, init: RequestInit = {}): Promise<Response> => {
        const method = init.method ?? 'GET'
        calls.push({ method, url, body: typeof init.body === 'string' ? init.body : init.body instanceof Uint8Array ? new TextDecoder().decode(init.body) : undefined })
        if (url === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: `tok-${Math.random()}`, expires_in: 3600 })
        if (method === 'GET') {
            const q = new URL(url).searchParams.get('q') ?? ''
            const name = /name = '([^']*)'/.exec(q)![1]
            const parent = /'([^']*)' in parents/.exec(q)![1]
            const isFolder = q.includes("mimeType = 'application/vnd.google-apps.folder'")
            const id = (isFolder ? folders : files).get(`${parent}|${name}`)
            return Response.json({ files: id ? [{ id, name }] : [] })
        }
        if (method === 'POST' && url.endsWith('/drive/v3/files')) {
            const meta = JSON.parse(String(init.body))
            const id = `f${next++}`
            folders.set(`${meta.parents[0]}|${meta.name}`, id)
            return Response.json({ id })
        }
        if (method === 'POST') return Response.json({ id: `u${next++}` })
        return Response.json({ id: 'patched' })
    }
    return { fetchImpl, calls, folders }
}

const config = { clientId: 'cid', clientSecret: 'secret', refreshToken: `rt-${Math.random()}` }

describe('Drive reports', () => {
    test('creates Reports / MHCU / year / month / code and uploads both files into it', async () => {
        const drive = fakeDrive()
        const drives = createDriveReports(config, drive.fetchImpl)
        const saved = await drives.saveReport({
            code: 'AT-MHCU-2026-120',
            at: new Date('2026-11-24T10:00:00Z'),
            files: [{ name: 'AT-MHCU-2026-120 - MHCU (ID).pdf', mimeType: 'application/pdf', data: new TextEncoder().encode('%PDF-id') }, { name: 'AT-MHCU-2026-120 - MHCU (EN).pdf', mimeType: 'application/pdf', data: '%PDF-en' }],
        })
        expect(saved.path).toBe('Reports / MHCU / 2026 / 11 / AT-MHCU-2026-120')
        const created = drive.calls.filter((c) => c.method === 'POST' && c.url.endsWith('/drive/v3/files')).map((c) => JSON.parse(c.body!).name)
        expect(created).toEqual(['Reports', 'MHCU', '2026', '11', 'AT-MHCU-2026-120'])
        const uploads = drive.calls.filter((c) => c.url.includes('uploadType=multipart'))
        expect(uploads).toHaveLength(2)
        expect(uploads[0].body).toContain('AT-MHCU-2026-120 - MHCU (ID).pdf')
        expect(uploads[0].body).toContain('application/pdf')
        expect(uploads[0].body).toContain('%PDF-id')
        expect(uploads[1].body).toContain('%PDF-en')
    })

    test('the internal reports go into their own tree beside MHCU, never inside the participant folder', async () => {
        const drive = fakeDrive({ folders: { 'root|Reports': 'r', 'r|MHCU': 'm', 'm|2026': 'y', 'y|11': 'mo', 'mo|AT-MHCU-2026-120': 'c' } })
        const drives = createDriveReports({ ...config, refreshToken: `rt-${Math.random()}` }, drive.fetchImpl)
        const saved = await drives.saveReport({ code: 'AT-MHCU-2026-120', at: new Date('2026-11-24T10:00:00Z'), folder: 'MHCU Internal', files: [{ name: 'x - MHCU Psikolog (ID).pdf', mimeType: 'application/pdf', data: '%PDF' }] })
        expect(saved.path).toBe('Reports / MHCU Internal / 2026 / 11 / AT-MHCU-2026-120')
        const created = drive.calls.filter((c) => c.method === 'POST' && c.url.endsWith('/drive/v3/files')).map((c) => JSON.parse(c.body!))
        expect(created.map((c) => c.name)).toEqual(['MHCU Internal', '2026', '11', 'AT-MHCU-2026-120'])
        // it hangs from the top folder, not from MHCU or the participant folder
        expect(created[0].parents).toEqual(['r'])
        expect(saved.folderId).not.toBe('c')
    })

    test('reuses existing folders and overwrites a file with the same name instead of adding a copy', async () => {
        const drive = fakeDrive({
            folders: { 'root|Reports': 'r', 'r|MHCU': 'm', 'm|2026': 'y', 'y|11': 'mo', 'mo|AT-MHCU-2026-120': 'c' },
            files: { 'c|AT-MHCU-2026-120 - MHCU (ID).pdf': 'file-1' },
        })
        const drives = createDriveReports({ ...config, refreshToken: `rt-${Math.random()}` }, drive.fetchImpl)
        await drives.saveReport({ code: 'AT-MHCU-2026-120', at: new Date('2026-11-24T10:00:00Z'), files: [{ name: 'AT-MHCU-2026-120 - MHCU (ID).pdf', mimeType: 'application/pdf', data: '%PDF-new' }] })
        expect(drive.calls.filter((c) => c.method === 'POST' && c.url.endsWith('/drive/v3/files'))).toHaveLength(0)
        const patch = drive.calls.find((c) => c.method === 'PATCH')!
        expect(patch.url).toContain('/file-1?uploadType=media')
        expect(patch.body).toBe('%PDF-new')
    })

    test('with a root folder id the folders go inside that folder and nothing is created at the top of My Drive', async () => {
        const drive = fakeDrive({ folders: {} })
        const drives = createDriveReports({ ...config, refreshToken: `rt-${Math.random()}`, rootFolderId: 'ROOT123' }, drive.fetchImpl)
        const saved = await drives.saveReport({ code: 'AT-MHCU-2026-120', at: new Date('2026-11-24T10:00:00Z'), files: [{ name: 'a.pdf', mimeType: 'application/pdf', data: '%PDF' }] })
        const created = drive.calls.filter((c) => c.method === 'POST' && c.url.endsWith('/drive/v3/files')).map((c) => JSON.parse(c.body!))
        expect(created.map((c) => c.name)).toEqual(['MHCU', '2026', '11', 'AT-MHCU-2026-120'])
        expect(created[0].parents).toEqual(['ROOT123'])
        expect(saved.path).toBe('Reports / MHCU / 2026 / 11 / AT-MHCU-2026-120')
    })

    test('the raw-answers sheet: created with its tab and header, a new key is appended, an existing key is updated', async () => {
        const calls: Array<{ method: string; url: string; body?: unknown }> = []
        let sheetExists = false
        const column: string[][] = [['Code']]
        const fetchImpl = async (url: string, init: RequestInit = {}): Promise<Response> => {
            const method = init.method ?? 'GET'
            const body = typeof init.body === 'string' && init.body.startsWith('{') ? JSON.parse(init.body) : undefined
            calls.push({ method, url, body })
            if (url === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: `tok-${Math.random()}`, expires_in: 3600 })
            if (url.startsWith('https://www.googleapis.com/drive/v3/files?')) {
                const q = new URL(url).searchParams.get('q') ?? ''
                if (q.includes('spreadsheet')) return Response.json({ files: sheetExists ? [{ id: 'sheet-1' }] : [] })
                return Response.json({ files: [] })
            }
            if (method === 'POST' && url.endsWith('/drive/v3/files')) { if (body.mimeType.includes('spreadsheet')) sheetExists = true; return Response.json({ id: body.mimeType.includes('spreadsheet') ? 'sheet-1' : 'f1' }) }
            if (url.includes('?fields=sheets.properties')) return Response.json({ sheets: [{ properties: { sheetId: 0, title: 'Sheet1' } }] })
            if (url.includes(':batchUpdate')) return Response.json({})
            if (method === 'GET' && url.includes('/values/')) return Response.json({ values: column })
            if (method === 'POST' && url.includes(':append')) { column.push([body.values[0][0]]); return Response.json({}) }
            return Response.json({})
        }
        const drives = createDriveReports({ ...config, refreshToken: `rt-${Math.random()}`, rootFolderId: 'ROOT' }, fetchImpl)
        const input = { title: 'MHCU Raw Answers', tab: 'Answers', headers: ['Code', 'Name'], key: 'AT-1', values: ['AT-1', 'Rina'] }

        expect(await drives.upsertSheetRow(input)).toEqual({ spreadsheetId: 'sheet-1', updated: false })
        const created = calls.find((c) => c.method === 'POST' && c.url.endsWith('/drive/v3/files'))!
        expect(created.body).toMatchObject({ name: 'MHCU Raw Answers', parents: ['ROOT'] })
        expect(calls.some((c) => c.url.includes(':batchUpdate') && JSON.stringify(c.body).includes('Answers'))).toBe(true)
        expect(calls.some((c) => c.method === 'PUT' && c.url.includes('A1%3AB1') && c.url.includes('valueInputOption=RAW'))).toBe(true)
        expect(calls.some((c) => c.method === 'POST' && c.url.includes(':append') && c.url.includes('valueInputOption=RAW'))).toBe(true)

        // the same code again updates its row (row 2) instead of adding a second one
        expect(await drives.upsertSheetRow({ ...input, values: ['AT-1', 'Rina B'] })).toEqual({ spreadsheetId: 'sheet-1', updated: true })
        const update = calls.filter((c) => c.method === 'PUT' && c.url.includes('A2%3AB2')).at(-1)!
        expect(update.body).toEqual({ values: [['AT-1', 'Rina B']] })
        expect(calls.filter((c) => c.method === 'POST' && c.url.includes(':append'))).toHaveLength(1)
    })

    test('column letters', () => {
        expect([1, 26, 27, 52, 53, 80].map(columnName)).toEqual(['A', 'Z', 'AA', 'AZ', 'BA', 'CB'])
    })

    test('a Drive error surfaces as an error (the caller logs it)', async () => {
        const failing = async (url: string): Promise<Response> =>
            url === 'https://oauth2.googleapis.com/token' ? Response.json({ access_token: 't', expires_in: 3600 }) : new Response('insufficient scope', { status: 403 })
        const drives = createDriveReports({ ...config, refreshToken: `rt-${Math.random()}` }, failing)
        await expect(drives.saveReport({ code: 'X', at: new Date(), files: [] })).rejects.toThrow('HTTP 403')
    })

    test('year and month follow Jakarta time', () => {
        expect(jakartaYearMonth(new Date('2026-12-31T18:00:00Z'))).toEqual({ year: '2027', month: '01' })
    })
})
