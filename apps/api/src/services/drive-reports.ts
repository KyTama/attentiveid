/**
 * Saves released MHCU reports to Google Drive, in this folder layout:
 *
 *   <root> / MHCU / <year> / <month> / <code> / <code> - MHCU (ID).pdf, <code> - MHCU (EN).pdf
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

export interface DriveReports {
    isConfigured: boolean
    saveReport(input: SaveReportInput): Promise<{ path: string; folderId: string; files: string[] }>
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'

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

    return {
        isConfigured: true,
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
