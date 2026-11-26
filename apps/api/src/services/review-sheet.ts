/** The Google Sheet where reviews are pasted. The website creates it (so drive.file may read it) and only reads rows. */
import { parseReviewRows, REVIEW_LIMITS, REVIEW_SHEET_HEADERS } from '@attentiveid/shared'
import type { ReviewImportsRepository } from '../repositories/review-imports.repository'
import type { DriveRequests } from './drive-reports'

export const REVIEW_SHEET_TITLE = 'Client Reviews'
export const REVIEW_SHEET_TAB = 'Reviews'

export interface ReviewImportResult {
  added: number
  duplicates: number
  skipped: number
  /** New ones beyond this import's limit; the next import takes them. */
  waiting: number
}

export interface ReviewSheet {
  /** Reads the sheet and stores new reviews. Two calls at once share one run. */
  importNow(): Promise<ReviewImportResult>
  url(): string
}

export const createReviewSheet = (repository: Pick<ReviewImportsRepository, 'add'>, drive: Pick<DriveRequests, 'readRequestSheet'>): ReviewSheet => {
  let spreadsheetId = ''
  let running: Promise<ReviewImportResult> | null = null

  const run = async (): Promise<ReviewImportResult> => {
    const sheet = await drive.readRequestSheet({ title: REVIEW_SHEET_TITLE, tab: REVIEW_SHEET_TAB, headers: [...REVIEW_SHEET_HEADERS], maxRows: REVIEW_LIMITS.rows })
    spreadsheetId = sheet.spreadsheetId
    const { reviews, skipped } = parseReviewRows(sheet.rows)
    const { added, waiting } = await repository.add(reviews)
    return { added, duplicates: reviews.length - added - waiting, skipped, waiting }
  }

  return {
    importNow() {
      running ??= run().finally(() => {
        running = null
      })
      return running
    },
    url: () => (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : ''),
  }
}
