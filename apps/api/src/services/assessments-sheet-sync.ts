import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository'
import { formatSheetRange, getGoogleAccessToken, normalizeGoogleSheetId, type GoogleBookingSyncConfig } from './booking-outbox'
import { toJakartaIso, type Fetcher } from './free-session-sheet'

export interface AssessmentsSheetConfig {
    google: GoogleBookingSyncConfig
    spreadsheetId: string
    /** Tab for the Mental Health Check-Up. */
    mhcuSheetName: string
}

export const MHCU_SHEET_HEADER = [
    'Code', 'Timestamp', 'Name', 'Age', 'Sex', 'Email', 'Phone', 'Language', 'Research consent', 'Guardian',
    'Level', 'MHI', 'DI', 'WI', 'BHI', 'ATI', 'Status', 'Answers (JSON)'
] as const

// Cells are written with valueInputOption=RAW, so Sheets stores every value as plain text and a formula can never run.
// (No leading apostrophe is added: it would show up inside names and phone numbers.)
const cell = (value: unknown): string => (value === null || value === undefined ? '' : String(value))

const scoreOf = (scores: unknown, key: string): string => {
    const record = scores && typeof scores === 'object' ? (scores as Record<string, unknown>) : {}
    // The personality index is stored as { total, index, category }.
    const raw = record[key]
    const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).total : raw
    return typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value * 10) / 10) : ''
}

export const mhcuSheetRow = (row: AssessmentRow): string[] => [
    row.code,
    toJakartaIso(row.createdAt),
    row.name,
    String(row.age),
    row.sex ?? '',
    row.email,
    row.phone,
    row.lang,
    row.researchConsent ? 'Ya' : 'Tidak',
    row.guardian ? 'Ya' : '',
    row.level === null ? '' : String(row.level),
    scoreOf(row.scores, 'mhi'),
    scoreOf(row.scores, 'di'),
    scoreOf(row.scores, 'wi'),
    scoreOf(row.scores, 'bhi'),
    scoreOf(row.scores, 'ati'),
    row.status,
    JSON.stringify(row.answers)
].map(cell)

const authed = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

export interface AssessmentsSheetSync {
    isConfigured: boolean
    /** Writes every MHCU submission that is not in the sheet yet. Safe to call often; one run at a time. */
    syncPending(): Promise<{ configured: boolean; synced: number; error: string | null }>
}

export const createAssessmentsSheetSync = (options: {
    repository: AssessmentsRepository
    config?: AssessmentsSheetConfig
    fetchFn?: Fetcher
    onError?: (error: unknown) => void
}): AssessmentsSheetSync => {
    let running: Promise<{ configured: boolean; synced: number; error: string | null }> | null = null
    const fetchImpl = options.fetchFn ?? fetch

    const run = async () => {
        const { repository, config } = options
        if (!config) return { configured: false, synced: 0, error: 'Google credentials or the assessments sheet are not configured.' }
        let synced = 0
        try {
            const pending = await repository.listUnsynced('mhcu', 200)
            if (pending.length === 0) return { configured: true, synced: 0, error: null }
            const token = await getGoogleAccessToken(config.google, fetchImpl, true)
            const id = encodeURIComponent(normalizeGoogleSheetId(config.spreadsheetId))
            const base = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values`
            const tab = config.mhcuSheetName.trim() || 'MHCU'

            // Write the header only when the tab is empty; an existing header row is never changed.
            const headRes = await fetchImpl(`${base}/${encodeURIComponent(formatSheetRange(tab, 'A1:A1'))}`, { method: 'GET', headers: authed(token) })
            if (!headRes.ok) throw new Error(`Google Sheets read failed: HTTP ${headRes.status}`)
            const head = (await headRes.json().catch(() => null)) as { values?: unknown[][] } | null
            const values: string[][] = []
            if (!head?.values?.[0]?.[0]) values.push([...MHCU_SHEET_HEADER])
            values.push(...pending.map(mhcuSheetRow))

            const url = `${base}/${encodeURIComponent(formatSheetRange(tab, 'A1'))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
            const res = await fetchImpl(url, { method: 'POST', headers: authed(token), body: JSON.stringify({ values }) })
            if (!res.ok) throw new Error(`Google Sheets append failed: HTTP ${res.status}`)
            await repository.markSheetSynced(pending.map((row) => row.id), null)
            synced = pending.length
            return { configured: true, synced, error: null }
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : String(caught)
            options.onError?.(caught)
            // Record why, so the portal can show it; the rows stay unsynced and are tried again on the next run.
            await options.repository.listUnsynced('mhcu', 200).then((rows) => options.repository.markSheetSynced(rows.map((row) => row.id), message.slice(0, 300))).catch(() => undefined)
            return { configured: true, synced, error: message }
        }
    }

    return {
        isConfigured: Boolean(options.config),
        syncPending() {
            running ??= run().finally(() => {
                running = null
            })
            return running
        },
    }
}
