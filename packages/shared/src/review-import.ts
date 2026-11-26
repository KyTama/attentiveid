/** Reviews pasted into a Google Sheet while Google API access is pending. Everything from the sheet is plain text. */
export const REVIEW_SHEET_HEADERS = ['Nama / inisial', 'Ulasan (Indonesia)', 'Review (English, optional)', 'Tanggal (optional)'] as const

/** New reviews per import and size per cell, so a wrong paste cannot flood the portal. `rows` bounds how far the sheet is read. */
export const REVIEW_LIMITS = { newPerImport: 500, rows: 20_000, name: 120, quote: 1000 } as const

export interface ReviewDraft {
  name: string
  quoteId: string
  quoteEn: string
}

export interface ImportedReview extends ReviewDraft {
  id: string
  status: 'new' | 'shown' | 'dismissed'
  importedAt: string
}

// Control characters and the invisible direction marks that can disguise text.
const UNSAFE = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g
const cell = (value: unknown, max: number): string =>
  (typeof value === 'string' ? value : '').replace(UNSAFE, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

/** Rows below the header. A row without a name or an Indonesian review is skipped. */
export const parseReviewRows = (rows: readonly (readonly unknown[])[]): { reviews: ReviewDraft[]; skipped: number } => {
  const reviews: ReviewDraft[] = []
  let skipped = 0
  for (const row of rows.slice(0, REVIEW_LIMITS.rows)) {
    const name = cell(row[0], REVIEW_LIMITS.name)
    const quoteId = cell(row[1], REVIEW_LIMITS.quote)
    if (!name && !quoteId) continue
    if (!name || !quoteId) {
      skipped++
      continue
    }
    reviews.push({ name, quoteId, quoteEn: cell(row[2], REVIEW_LIMITS.quote) || quoteId })
  }
  return { reviews, skipped }
}

/** What makes two rows the same review: who and what, ignoring capitals and spacing. */
export const reviewIdentity = (review: ReviewDraft): string => `${review.name}\n${review.quoteId}`.toLowerCase()
