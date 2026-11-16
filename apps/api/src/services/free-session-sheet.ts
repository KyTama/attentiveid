import { genderLabel, keluhanLabel, type FreeSessionRecord } from '@attentiveid/shared'
import { formatSheetRange, getGoogleAccessToken, normalizeGoogleSheetId, type GoogleBookingSyncConfig } from './booking-outbox'

export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

export interface FreeSessionSheetConfig {
    google: GoogleBookingSyncConfig
    /** Spreadsheet id or URL. */
    spreadsheetId: string
    /** Tab name. */
    sheetName: string
}

/** The row id used in the sheet: the first 12 characters of the submission id (matches the old sheet's id style). */
export const sheetRowId = (submissionId: string) => submissionId.replace(/-/g, '').slice(0, 12)

/** "2026-10-01T09:13:09+07:00": the time in Jakarta, as ISO text (same shape as the existing rows). */
export const toJakartaIso = (value: string | Date): string => {
    const ms = new Date(value).getTime()
    const shifted = new Date(ms + 7 * 3600 * 1000).toISOString().slice(0, 19)
    return `${shifted}+07:00`
}

/** Values by (normalised) column meaning. Columns this form does not collect stay empty. */
export const freeSessionSheetValues = (record: FreeSessionRecord): Record<string, string> => ({
    id: sheetRowId(record.id),
    timestamp: toJakartaIso(record.createdAt),
    nama: record.name,
    umur: String(record.age),
    'jenis kelamin': genderLabel(record.gender),
    'nomor whatsapp': record.phone,
    email: record.email ?? '',
    'keluhan (kode)': record.keluhan,
    'keluhan (label)': keluhanLabel(record.keluhan) ?? '',
    'ceritakan lebih lanjut': record.keluhanDetail ?? '',
    setuju: 'Ya',
})

const COLUMN_PREFIXES = [
    'id',
    'timestamp',
    'nama',
    'umur',
    'jenis kelamin',
    'nomor whatsapp',
    'email',
    'keluhan (kode)',
    'keluhan (label)',
    'ceritakan lebih lanjut',
    'setuju',
] as const

/** Which value a header cell stands for ("Setuju dihut..." style truncation is tolerated). */
const columnFor = (header: string): string | null => {
    const key = header.trim().toLowerCase()
    if (!key) return null
    return (
        COLUMN_PREFIXES.find((prefix) => {
            if (prefix === 'id') return key === 'id'
            // Full header, or a cut-off one such as "Setuju dihut".
            return key.startsWith(prefix) || (key.length >= 4 && prefix.startsWith(key))
        }) ?? null
    )
}

/** Formula-looking text is stored as plain text so a cell can never run as a formula. */
const safeCell = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value)

export const alignFreeSessionRow = (headers: string[], record: FreeSessionRecord): string[] => {
    const values = freeSessionSheetValues(record)
    return headers.map((header) => {
        const column = columnFor(header)
        return column ? safeCell(values[column] ?? '') : ''
    })
}

const authed = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

const failure = async (what: string, response: Response) => {
    const snippet = (await response.text().catch(() => '')).slice(0, 300)
    return new Error(`${what}: HTTP ${response.status}${snippet ? ` ${snippet}` : ''}`)
}

/**
 * Appends the records to the sheet, matching the sheet's own header row so editor column moves never
 * misalign data, and skipping ids that are already in the sheet. Returns the ids that are now in the sheet.
 * The header row and existing rows are never changed.
 */
export async function appendFreeSessionRecords(
    config: FreeSessionSheetConfig,
    records: readonly FreeSessionRecord[],
    fetchImpl: Fetcher = fetch,
): Promise<string[]> {
    if (records.length === 0) return []
    const token = await getGoogleAccessToken(config.google, fetchImpl, true)
    const spreadsheetId = encodeURIComponent(normalizeGoogleSheetId(config.spreadsheetId))
    const sheet = config.sheetName.trim() || 'Sheet1'
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values`

    const headerResponse = await fetchImpl(`${base}/${encodeURIComponent(formatSheetRange(sheet, 'A1:AZ1'))}`, { method: 'GET', headers: authed(token) })
    if (!headerResponse.ok) throw await failure('Google Sheets header read failed', headerResponse)
    const headerJson = (await headerResponse.json().catch(() => null)) as { values?: unknown[][] } | null
    const headers = (headerJson?.values?.[0] ?? []).map((cell) => String(cell ?? ''))
    if (!headers.some((header) => columnFor(header))) {
        throw new Error('Sheet header row not recognised (expected columns like ID, Timestamp, Nama...)')
    }

    const idColumnIndex = headers.findIndex((header) => columnFor(header) === 'id')
    let existingIds = new Set<string>()
    if (idColumnIndex >= 0) {
        const letter = String.fromCharCode(65 + Math.min(idColumnIndex, 25))
        const idResponse = await fetchImpl(`${base}/${encodeURIComponent(formatSheetRange(sheet, `${letter}2:${letter}`))}`, { method: 'GET', headers: authed(token) })
        if (!idResponse.ok) throw await failure('Google Sheets id read failed', idResponse)
        const idJson = (await idResponse.json().catch(() => null)) as { values?: unknown[][] } | null
        existingIds = new Set((idJson?.values ?? []).map((row) => String(row?.[0] ?? '').trim()).filter(Boolean))
    }

    const present: string[] = []
    const fresh: FreeSessionRecord[] = []
    for (const record of records) {
        if (existingIds.has(sheetRowId(record.id))) present.push(record.id)
        else fresh.push(record)
    }

    if (fresh.length > 0) {
        // Oldest first so the sheet stays in time order.
        const rows = [...fresh].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)).map((record) => alignFreeSessionRow(headers, record))
        const appendUrl = `${base}/${encodeURIComponent(formatSheetRange(sheet, 'A1'))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
        const appendResponse = await fetchImpl(appendUrl, { method: 'POST', headers: authed(token), body: JSON.stringify({ values: rows }) })
        if (!appendResponse.ok) throw await failure('Google Sheets append failed', appendResponse)
    }

    return [...present, ...fresh.map((record) => record.id)]
}
