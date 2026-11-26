import { describe, expect, it } from 'bun:test'
import { parseReviewRows, REVIEW_LIMITS, type ReviewDraft } from '@attentiveid/shared'
import { createReviewSheet } from '../services/review-sheet'

describe('review sheet rows', () => {
  it('caps cells and rows, strips hidden characters, keeps markup as plain text and skips half-filled rows', () => {
    const { reviews, skipped } = parseReviewRows([
      ['  Rina\u202e ', 'Bagus\nsekali <b>ya</b>'],
      ['Tanpa ulasan', ''],
      ['', ''],
      ['N'.repeat(500), 'q'.repeat(5000), 'Good', '2026'],
    ])
    expect(skipped).toBe(1)
    expect(reviews[0]).toEqual({ name: 'Rina', quoteId: 'Bagus sekali <b>ya</b>', quoteEn: 'Bagus sekali <b>ya</b>' })
    expect([reviews[1]!.name.length, reviews[1]!.quoteId.length, reviews[1]!.quoteEn]).toEqual([REVIEW_LIMITS.name, REVIEW_LIMITS.quote, 'Good'])
    // The whole sheet is read, not just the first 500 rows.
    expect(parseReviewRows(Array.from({ length: 900 }, (_, i) => [`n${i}`, 'q'])).reviews.length).toBe(900)
  })

  it('reports what was added and what was already known', async () => {
    const stored: ReviewDraft[] = []
    const sheet = createReviewSheet(
      { add: async (reviews) => { const fresh = reviews.filter((r) => !stored.some((s) => s.name === r.name)); stored.push(...fresh); return { added: fresh.length, waiting: 0 } } },
      { readRequestSheet: async () => ({ spreadsheetId: 'abc', rows: [['A', 'x'], ['B', 'y'], ['C', '']] }) },
    )
    expect(await sheet.importNow()).toEqual({ added: 2, duplicates: 0, skipped: 1, waiting: 0 })
    expect(await sheet.importNow()).toEqual({ added: 0, duplicates: 2, skipped: 1, waiting: 0 })
    expect(sheet.url()).toContain('/d/abc')
  })
})
