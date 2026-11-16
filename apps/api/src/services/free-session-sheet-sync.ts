import type { FreeSessionRepository } from '../repositories/free-session.repository'
import { normalizeGoogleSheetId } from './booking-outbox'
import { appendFreeSessionRecords, type Fetcher, type FreeSessionSheetConfig } from './free-session-sheet'

export interface FreeSessionSyncResult {
    /** Google credentials are set on the server. */
    configured: boolean
    synced: number
    /** Rows still not in the sheet after this run. */
    pending: number
    failed: number
    error: string | null
}

export interface FreeSessionSheetSync {
    isConfigured: boolean
    /** Writes every submission that is not in the sheet yet. Safe to call often. */
    syncPending(): Promise<FreeSessionSyncResult>
    /** Counts only; does not contact Google. */
    status(): Promise<Omit<FreeSessionSyncResult, 'synced' | 'error'> & { spreadsheetUrl: string | null }>
}

const BATCH = 200

/**
 * Keeps the Google Sheet in step with the database: each run sends everything not yet marked as synced
 * (so a failed attempt is retried by the next submission or by the portal button). One run at a time.
 */
export const createFreeSessionSheetSync = (options: {
    repository: FreeSessionRepository
    config?: FreeSessionSheetConfig
    fetchFn?: Fetcher
    onError?: (error: unknown) => void
}): FreeSessionSheetSync => {
    let running: Promise<FreeSessionSyncResult> | null = null

    const run = async (): Promise<FreeSessionSyncResult> => {
        const { repository, config } = options
        if (!config) {
            const status = await repository.sheetStatus()
            return { configured: false, synced: 0, pending: status.pending, failed: status.failed, error: 'Google credentials are not configured on the server.' }
        }
        let synced = 0
        let error: string | null = null
        try {
            for (;;) {
                const batch = await repository.listUnsynced(BATCH)
                if (batch.length === 0) break
                const ids = batch.map((record) => record.id)
                try {
                    const done = await appendFreeSessionRecords(config, batch, options.fetchFn)
                    await repository.markSynced(done)
                    synced += done.length
                } catch (caught) {
                    error = caught instanceof Error ? caught.message : String(caught)
                    await repository.markFailed(ids, error)
                    options.onError?.(caught)
                    break
                }
                if (batch.length < BATCH) break
            }
        } catch (caught) {
            error = caught instanceof Error ? caught.message : String(caught)
            options.onError?.(caught)
        }
        const status = await repository.sheetStatus()
        return { configured: true, synced, pending: status.pending, failed: status.failed, error }
    }

    return {
        isConfigured: Boolean(options.config),
        async status() {
            const counts = await options.repository.sheetStatus()
            const id = options.config ? normalizeGoogleSheetId(options.config.spreadsheetId) : null
            return { configured: Boolean(options.config), pending: counts.pending, failed: counts.failed, spreadsheetUrl: id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : null }
        },
        syncPending() {
            running ??= run().finally(() => {
                running = null
            })
            return running
        },
    }
}
