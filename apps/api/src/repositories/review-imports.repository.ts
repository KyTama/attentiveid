import { createHash } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { REVIEW_LIMITS, reviewIdentity, type ImportedReview, type ReviewDraft } from '@attentiveid/shared'
import { db as defaultDb } from '../db'
import { reviewImports } from '../db/schema'

export interface ReviewImportsRepository {
  /** Stores the ones not seen before, as new (hidden), up to the per-import limit; `waiting` are left for the next import. */
  add(reviews: ReviewDraft[]): Promise<{ added: number; waiting: number }>
  listNew(): Promise<ImportedReview[]>
  setStatus(id: string, status: 'shown' | 'dismissed'): Promise<boolean>
}

export const createReviewImportsRepository = (database: typeof defaultDb = defaultDb): ReviewImportsRepository => ({
  async add(reviews) {
    // Known ones are skipped before the limit applies, so rows far down the sheet are reached too.
    const known = new Set((await database.select({ hash: reviewImports.sourceHash }).from(reviewImports)).map((row) => row.hash))
    const fresh: (ReviewDraft & { sourceHash: string })[] = []
    for (const review of reviews) {
      const sourceHash = createHash('sha256').update(reviewIdentity(review)).digest('hex')
      if (known.has(sourceHash)) continue
      known.add(sourceHash)
      fresh.push({ ...review, sourceHash })
    }
    const batch = fresh.slice(0, REVIEW_LIMITS.newPerImport)
    if (batch.length === 0) return { added: 0, waiting: 0 }
    const added = await database.insert(reviewImports).values(batch).onConflictDoNothing().returning({ id: reviewImports.id })
    return { added: added.length, waiting: fresh.length - batch.length }
  },
  async listNew() {
    const rows = await database.select().from(reviewImports).where(eq(reviewImports.status, 'new')).orderBy(desc(reviewImports.importedAt)).limit(500)
    return rows.map(({ sourceHash: _hash, ...row }) => row as ImportedReview)
  },
  async setStatus(id, status) {
    const rows = await database.update(reviewImports).set({ status }).where(eq(reviewImports.id, id)).returning({ id: reviewImports.id })
    return rows.length > 0
  },
})
