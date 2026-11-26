import { createHash } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { reviewIdentity, type ImportedReview, type ReviewDraft } from '@attentiveid/shared'
import { db as defaultDb } from '../db'
import { reviewImports } from '../db/schema'

export interface ReviewImportsRepository {
  /** Stores the ones not seen before, as new (hidden). Returns how many were added. */
  add(reviews: ReviewDraft[]): Promise<number>
  listNew(): Promise<ImportedReview[]>
  setStatus(id: string, status: 'shown' | 'dismissed'): Promise<boolean>
}

export const createReviewImportsRepository = (database: typeof defaultDb = defaultDb): ReviewImportsRepository => ({
  async add(reviews) {
    if (reviews.length === 0) return 0
    const rows = reviews.map((review) => ({ ...review, sourceHash: createHash('sha256').update(reviewIdentity(review)).digest('hex') }))
    const added = await database.insert(reviewImports).values(rows).onConflictDoNothing().returning({ id: reviewImports.id })
    return added.length
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
