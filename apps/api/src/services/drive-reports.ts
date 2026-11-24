/**
 * Saves released MHCU reports to Google Drive, in this folder layout:
 *
 *   <root> / MHCU / <year> / <month> / <code> / <code> - MHCU (ID).pdf, <code> - MHCU (EN).pdf
 *   <root> / <spreadsheet>   one Google Sheet with a row per submission (see upsertSheetRow)
 *
 * <root> is the folder with GOOGLE_DRIVE_ROOT_FOLDER_ID when that is set (a folder this app created itself, which the team may move
 * anywhere in Drive), otherwise a "Reports" folder in My Drive that the app creates on first use. The sub-folders are found by name
 * and created when missing. The Drive account is the one that owns the refresh token (GOOGLE_DRIVE_REFRESH_TOKEN, scope drive.file:
 * the app only sees files and folders it created itself). Saving again overwrites the file with the same name.
 */

import { getGoogleAccessToken } from './booking-outbox'

type Fetcher = (url: string, init: RequestInit) => Promise<Response>

export interface DriveReportsConfig {
    clientId: string
    clientSecret: string
    refreshToken: string
    /** Name of the top folder in My Drive (used only when there is no root folder id). */
    rootName?: string
    /** Id of the folder the reports go into. It must be a folder this app created (drive.file cannot see others). */
    rootFolderId?: string
}

export interface ReportFile {
    name: string
    mimeType: string
    data: Uint8Array | string
}

export interface SaveReportInput {
    code: string
    /** When the report was released (decides the year and month folders, Jakarta time). */
    at: Date
    files: ReportFile[]
}

export interface SheetRowInput {
    /** File name of the spreadsheet in the root folder. */
    title: string
    /** Tab that holds the rows (the first tab is renamed to this when the spreadsheet is created). */
    tab: string
    /** Column titles, written to row 1. */
    headers: string[]
    /** The first cell of the row (the code): an existing row with the same key is updated instead of adding a second one. */
    key: string
    values: string[]
}

export interface DriveReports {
    isConfigured: boolean
    saveReport(input: SaveReportInput): Promise<{ path: string; folderId: string; files: string[] }>
    /** Adds (or updates) one row of a Google Sheet in the root folder, creating the sheet when it does not exist yet. */
    upsertSheetRow(input: SheetRowInput): Promise<{ spreadsheetId: string; updated: boolean }>
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'
const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets'
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet'

/** Column letters for a 1-based column number: 1 = A, 27 = AA. */
export const columnName = (n: number): string => {
    let out = ''
    for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) out = String.fromCharCode(65 + ((x - 1) % 26)) + out
    return out
}

/** A value inside a Drive search query. */
const quote = (value: string): string => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const failure = async (what: string, response: Response) => {
    const snippet = (await response.text().catch(() => '')).slice(0, 300)
    return new Error(`${what}: HTTP ${response.status}${snippet ? ` ${snippet}` : ''}`)
}

const bytes = (data: Uint8Array | string): Uint8Array => (typeof data === 'string' ? new TextEncoder().encode(data) : data)

/** Year and two-digit month of a moment, in Jakarta time. */
export const jakartaYearMonth = (at: Date): { year: string; month: string } => {
    const jakarta = new Date(at.getTime() + 7 * 3600_000)
    return { year: String(jakarta.getUTCFullYear()), month: String(jakarta.getUTCMonth() + 1).padStart(2, '0') }
}

export const createDriveReports = (config: DriveReportsConfig, fetchImpl: Fetcher = fetch): DriveReports => {
    const rootName = config.rootName?.trim() || 'Reports'
    const rootFolderId = config.rootFolderId?.trim() || ''
    /** path -> folder id, so a busy day does not search for the same folders again. */
    const folderIds = new Map<string, string>()

    const token = () =>
        getGoogleAccessToken({ clientId: config.clientId, clientSecret: config.clientSecret, refreshToken: config.refreshToken } as never, fetchImpl, true)

    const headers = async (extra: Record<string, string> = {}) => ({ Authorization: `Bearer ${await token()}`, ...extra })

    const findOne = async (name: string, parentId: string, mimeFolder: boolean): Promise<string | null> => {
        const query = `name = ${quote(name)} and ${quote(parentId)} in parents and trashed = false and mimeType ${mimeFolder ? '=' : '!='} '${FOLDER_MIME}'`
        const response = await fetchImpl(`${API}?${new URLSearchParams({ q: query, fields: 'files(id,name)', spaces: 'drive', pageSize: '1' })}`, { method: 'GET', headers: await headers() })
        if (!response.ok) throw await failure('Drive search', response)
        const json = (await response.json()) as { files?: Array<{ id: string }> }
        return json.files?.[0]?.id ?? null
    }

    const ensureFolder = async (name: string, parentId: string, pathKey: string): Promise<string> => {
        const cached = folderIds.get(pathKey)
        if (cached) return cached
        let id = await findOne(name, parentId, true)
        if (!id) {
            const response = await fetchImpl(API, {
                method: 'POST',
                headers: await headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
            })
            if (!response.ok) throw await failure('Drive folder create', response)
            id = ((await response.json()) as { id: string }).id
        }
        folderIds.set(pathKey, id)
        return id
    }

    const upload = async (file: ReportFile, parentId: string): Promise<void> => {
        const content = bytes(file.data)
        const existing = await findOne(file.name, parentId, false)
        if (existing) {
            const response = await fetchImpl(`${UPLOAD}/${encodeURIComponent(existing)}?uploadType=media`, {
                method: 'PATCH',
                headers: await headers({ 'Content-Type': file.mimeType }),
                body: content as BodyInit,
            })
            if (!response.ok) throw await failure('Drive file update', response)
            return
        }
        const boundary = `report-${Math.random().toString(36).slice(2)}`
        const metadata = JSON.stringify({ name: file.name, parents: [parentId], mimeType: file.mimeType })
        const head = new TextEncoder().encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.mimeType}\r\n\r\n`)
        const tail = new TextEncoder().encode(`\r\n--${boundary}--`)
        const body = new Uint8Array(head.length + content.length + tail.length)
        body.set(head, 0)
        body.set(content, head.length)
        body.set(tail, head.length + content.length)
        const response = await fetchImpl(`${UPLOAD}?uploadType=multipart`, {
            method: 'POST',
            headers: await headers({ 'Content-Type': `multipart/related; boundary=${boundary}` }),
            body: body as BodyInit,
        })
        if (!response.ok) throw await failure('Drive file upload', response)
    }

    const rootId = async (): Promise<string> => rootFolderId || ensureFolder(rootName, 'root', `/${rootName}`)

    const sheetIds = new Map<string, string>()
    const headerWritten = new Set<string>()

    const sheetsCall = async (what: string, url: string, init: RequestInit & { json?: unknown }): Promise<Response> => {
        const { json, ...rest } = init
        const response = await fetchImpl(url, {
            ...rest,
            headers: await headers(json === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(json === undefined ? {} : { body: JSON.stringify(json) }),
        })
        if (!response.ok) throw await failure(what, response)
        return response
    }

    const ensureSpreadsheet = async (title: string, tab: string): Promise<string> => {
        const cached = sheetIds.get(title)
        if (cached) return cached
        const parent = await rootId()
        const query = `name = ${quote(title)} and ${quote(parent)} in parents and trashed = false and mimeType = '${SHEET_MIME}'`
        const found = await fetchImpl(`${API}?${new URLSearchParams({ q: query, fields: 'files(id)', spaces: 'drive', pageSize: '1' })}`, { method: 'GET', headers: await headers() })
        if (!found.ok) throw await failure('Drive search', found)
        let id = ((await found.json()) as { files?: Array<{ id: string }> }).files?.[0]?.id ?? null
        if (!id) {
            const created = await sheetsCall('Drive sheet create', API, { method: 'POST', json: { name: title, mimeType: SHEET_MIME, parents: [parent] } })
            id = ((await created.json()) as { id: string }).id
            // The new spreadsheet has one tab called Sheet1: give it the wanted name.
            const info = await sheetsCall('Sheets read', `${SHEETS}/${encodeURIComponent(id)}?fields=sheets.properties`, { method: 'GET' })
            const first = ((await info.json()) as { sheets?: Array<{ properties: { sheetId: number; title: string } }> }).sheets?.[0]?.properties
            if (first && first.title !== tab) {
                await sheetsCall('Sheets rename tab', `${SHEETS}/${encodeURIComponent(id)}:batchUpdate`, {
                    method: 'POST',
                    json: { requests: [{ updateSheetProperties: { properties: { sheetId: first.sheetId, title: tab }, fields: 'title' } }] },
                })
            }
        }
        sheetIds.set(title, id)
        return id
    }

    return {
        isConfigured: true,
        async upsertSheetRow(input) {
            const spreadsheetId = await ensureSpreadsheet(input.title, input.tab)
            const base = `${SHEETS}/${encodeURIComponent(spreadsheetId)}/values`
            const range = (a1: string) => encodeURIComponent(`${input.tab}!${a1}`)
            // RAW: every value is stored as plain text, so nothing can run as a formula and phone numbers keep their leading 0.
            const headerKey = `${spreadsheetId}:${input.headers.length}`
            if (!headerWritten.has(headerKey)) {
                await sheetsCall('Sheets header', `${base}/${range(`A1:${columnName(input.headers.length)}1`)}?valueInputOption=RAW`, { method: 'PUT', json: { values: [input.headers] } })
                headerWritten.add(headerKey)
            }
            const column = await sheetsCall('Sheets read', `${base}/${range('A:A')}`, { method: 'GET' })
            const keys = ((await column.json()) as { values?: string[][] }).values ?? []
            const index = keys.findIndex((cell, i) => i > 0 && cell?.[0] === input.key)
            if (index >= 0) {
                await sheetsCall('Sheets update', `${base}/${range(`A${index + 1}:${columnName(input.values.length)}${index + 1}`)}?valueInputOption=RAW`, { method: 'PUT', json: { values: [input.values] } })
                return { spreadsheetId, updated: true }
            }
            await sheetsCall('Sheets append', `${base}/${range('A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', json: { values: [input.values] } })
            return { spreadsheetId, updated: false }
        },
        async saveReport(input) {
            const { year, month } = jakartaYearMonth(input.at)
            const segments = rootFolderId ? ['MHCU', year, month, input.code] : [rootName, 'MHCU', year, month, input.code]
            let parent = rootFolderId || 'root'
            let key = rootFolderId ? `/${rootFolderId}` : ''
            for (const segment of segments) {
                key = `${key}/${segment}`
                parent = await ensureFolder(segment, parent, key)
            }
            for (const file of input.files) await upload(file, parent)
            return { path: (rootFolderId ? ['Reports', ...segments] : segments).join(' / '), folderId: parent, files: input.files.map((file) => file.name) }
        },
    }
}
