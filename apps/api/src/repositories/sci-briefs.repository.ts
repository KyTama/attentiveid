import { and, asc, desc, eq, lte, sql } from 'drizzle-orm'
import type { SciBriefAdminDto, SciBriefInput, SciBriefPublicDto } from '@attentiveid/shared'
import { db as defaultDb } from '../db'
import { sciBriefFiles, sciBriefs } from '../db/schema'

type BriefRow = typeof sciBriefs.$inferSelect

export interface SciBriefDocumentInput {
  documentName: string
  totalPages: number
  previewPages: number
  previewBytes: Buffer
  fullBytes: Buffer
}

export interface SciBriefsRepository {
  listPublic(now?: Date): Promise<SciBriefPublicDto[]>
  getPublicBySlug(slug: string, now?: Date): Promise<SciBriefPublicDto | null>
  getPreviewBySlug(slug: string, now?: Date): Promise<Buffer | null>
  listAdmin(): Promise<SciBriefAdminDto[]>
  getAdminById(id: string): Promise<SciBriefAdminDto | null>
  create(input: SciBriefInput): Promise<SciBriefAdminDto>
  update(id: string, input: SciBriefInput): Promise<SciBriefAdminDto | null>
  remove(id: string): Promise<boolean>
  saveDocument(id: string, document: SciBriefDocumentInput): Promise<SciBriefAdminDto | null>
  /** Updates only the preview file (for example after the preview page count changed). */
  savePreview(id: string, previewPages: number, previewBytes: Buffer): Promise<void>
  getFile(id: string, kind: 'preview' | 'full'): Promise<{ data: Buffer; documentName: string | null } | null>
}

const toIso = (value: string) => new Date(value).toISOString()

const toPublic = (row: BriefRow, hasPreview: boolean): SciBriefPublicDto => ({
  id: row.id,
  slug: row.slug,
  title: { id: row.titleId, en: row.titleEn },
  summary: { id: row.summaryId, en: row.summaryEn },
  periodMonth: row.periodMonth,
  releaseAt: toIso(row.releaseAt),
  totalPages: row.totalPages,
  previewPages: row.previewPages,
  previewUrl: hasPreview ? `/api/content/sci-briefs/${row.slug}/preview.pdf` : null,
})

const toAdmin = (row: BriefRow, hasDocument: boolean): SciBriefAdminDto => ({
  id: row.id,
  slug: row.slug,
  title: { id: row.titleId, en: row.titleEn },
  summary: { id: row.summaryId, en: row.summaryEn },
  periodMonth: row.periodMonth,
  releaseAt: toIso(row.releaseAt),
  totalPages: row.totalPages,
  previewPages: row.previewPages,
  status: row.status as SciBriefAdminDto['status'],
  documentName: row.documentName,
  hasDocument,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
})

export const createSciBriefsRepository = (database: typeof defaultDb = defaultDb): SciBriefsRepository => {
  const hasFile = async (briefId: string, kind: 'preview' | 'full') => {
    const rows = await database
      .select({ id: sciBriefFiles.id })
      .from(sciBriefFiles)
      .where(and(eq(sciBriefFiles.briefId, briefId), eq(sciBriefFiles.kind, kind)))
      .limit(1)
    return rows.length > 0
  }

  const publicWhere = (now: Date) =>
    and(eq(sciBriefs.status, 'published'), lte(sciBriefs.releaseAt, now.toISOString()))

  const values = (input: SciBriefInput) => ({
    slug: input.slug,
    titleId: input.titleId,
    titleEn: input.titleEn,
    summaryId: input.summaryId,
    summaryEn: input.summaryEn,
    periodMonth: input.periodMonth,
    releaseAt: input.releaseAt,
    status: input.status,
    previewPages: input.previewPages,
  })

  return {
    async listPublic(now = new Date()) {
      const rows = await database
        .select()
        .from(sciBriefs)
        .where(publicWhere(now))
        .orderBy(desc(sciBriefs.periodMonth), desc(sciBriefs.releaseAt))
      const previews = await database
        .select({ briefId: sciBriefFiles.briefId })
        .from(sciBriefFiles)
        .where(eq(sciBriefFiles.kind, 'preview'))
      const withPreview = new Set(previews.map(({ briefId }) => briefId))
      return rows.map((row) => toPublic(row, withPreview.has(row.id)))
    },

    async getPublicBySlug(slug, now = new Date()) {
      const [row] = await database
        .select()
        .from(sciBriefs)
        .where(and(eq(sciBriefs.slug, slug), publicWhere(now)))
        .limit(1)
      return row ? toPublic(row, await hasFile(row.id, 'preview')) : null
    },

    async getPreviewBySlug(slug, now = new Date()) {
      const [row] = await database
        .select({ id: sciBriefs.id })
        .from(sciBriefs)
        .where(and(eq(sciBriefs.slug, slug), publicWhere(now)))
        .limit(1)
      if (!row) return null
      const [file] = await database
        .select({ data: sciBriefFiles.data })
        .from(sciBriefFiles)
        .where(and(eq(sciBriefFiles.briefId, row.id), eq(sciBriefFiles.kind, 'preview')))
        .limit(1)
      return file ? Buffer.from(file.data) : null
    },

    async listAdmin() {
      const rows = await database
        .select()
        .from(sciBriefs)
        .orderBy(desc(sciBriefs.periodMonth), asc(sciBriefs.titleId))
      const files = await database
        .select({ briefId: sciBriefFiles.briefId })
        .from(sciBriefFiles)
        .where(eq(sciBriefFiles.kind, 'full'))
      const withDocument = new Set(files.map(({ briefId }) => briefId))
      return rows.map((row) => toAdmin(row, withDocument.has(row.id)))
    },

    async getAdminById(id) {
      const [row] = await database.select().from(sciBriefs).where(eq(sciBriefs.id, id)).limit(1)
      return row ? toAdmin(row, await hasFile(row.id, 'full')) : null
    },

    async create(input) {
      const [row] = await database.insert(sciBriefs).values(values(input)).returning()
      return toAdmin(row, false)
    },

    async update(id, input) {
      const [row] = await database
        .update(sciBriefs)
        .set({ ...values(input), updatedAt: sql`now()` })
        .where(eq(sciBriefs.id, id))
        .returning()
      return row ? toAdmin(row, await hasFile(row.id, 'full')) : null
    },

    async remove(id) {
      const rows = await database.delete(sciBriefs).where(eq(sciBriefs.id, id)).returning({ id: sciBriefs.id })
      return rows.length > 0
    },

    async saveDocument(id, document) {
      return database.transaction(async (tx) => {
        const [row] = await tx
          .update(sciBriefs)
          .set({
            documentName: document.documentName,
            totalPages: document.totalPages,
            previewPages: document.previewPages,
            updatedAt: sql`now()`,
          })
          .where(eq(sciBriefs.id, id))
          .returning()
        if (!row) return null
        for (const [kind, data] of [
          ['preview', document.previewBytes],
          ['full', document.fullBytes],
        ] as const) {
          await tx
            .insert(sciBriefFiles)
            .values({ briefId: id, kind, data, byteSize: data.length })
            .onConflictDoUpdate({
              target: [sciBriefFiles.briefId, sciBriefFiles.kind],
              set: { data, byteSize: data.length, updatedAt: sql`now()` },
            })
        }
        return toAdmin(row, true)
      })
    },

    async savePreview(id, previewPages, previewBytes) {
      await database.transaction(async (tx) => {
        await tx.update(sciBriefs).set({ previewPages, updatedAt: sql`now()` }).where(eq(sciBriefs.id, id))
        await tx
          .insert(sciBriefFiles)
          .values({ briefId: id, kind: 'preview', data: previewBytes, byteSize: previewBytes.length })
          .onConflictDoUpdate({
            target: [sciBriefFiles.briefId, sciBriefFiles.kind],
            set: { data: previewBytes, byteSize: previewBytes.length, updatedAt: sql`now()` },
          })
      })
    },

    async getFile(id, kind) {
      const [brief] = await database
        .select({ documentName: sciBriefs.documentName })
        .from(sciBriefs)
        .where(eq(sciBriefs.id, id))
        .limit(1)
      if (!brief) return null
      const [file] = await database
        .select({ data: sciBriefFiles.data })
        .from(sciBriefFiles)
        .where(and(eq(sciBriefFiles.briefId, id), eq(sciBriefFiles.kind, kind)))
        .limit(1)
      return file ? { data: Buffer.from(file.data), documentName: brief.documentName } : null
    },
  }
}
