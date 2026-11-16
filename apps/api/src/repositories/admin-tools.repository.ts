import { asc, desc, eq, sql } from 'drizzle-orm'
import {
  featuredProductState,
  jakartaDay,
  type FeaturedProductAdminDto,
  type FeaturedProductInput,
  type FeaturedProductPublicDto,
  type QrCodeDto,
  type QrCodeInput,
  type SharePreviewDto,
  type SharePreviewInput,
  type TrafficDayRow,
} from '@attentiveid/shared'
import { db as defaultDb } from '../db'
import { featuredProducts, pageViewDaily, qrCodes, sharePreviews } from '../db/schema'

export interface AdminToolsRepository {
  // Featured products
  listActiveFeatured(now?: Date): Promise<FeaturedProductPublicDto[]>
  listFeaturedAdmin(now?: Date): Promise<FeaturedProductAdminDto[]>
  createFeatured(input: FeaturedProductInput): Promise<FeaturedProductAdminDto>
  updateFeatured(id: string, input: FeaturedProductInput): Promise<FeaturedProductAdminDto | null>
  removeFeatured(id: string): Promise<boolean>
  // Share previews
  getSharePreview(path: string): Promise<SharePreviewDto | null>
  listSharePreviews(): Promise<SharePreviewDto[]>
  saveSharePreview(input: SharePreviewInput): Promise<SharePreviewDto>
  removeSharePreview(id: string): Promise<boolean>
  // Traffic
  recordPageView(path: string, newSession: boolean, now?: Date): Promise<void>
  listTrafficRows(): Promise<TrafficDayRow[]>
  // QR codes
  listQrCodes(): Promise<QrCodeDto[]>
  createQrCode(input: QrCodeInput): Promise<QrCodeDto>
  updateQrCode(id: string, input: QrCodeInput): Promise<QrCodeDto | null>
  removeQrCode(id: string): Promise<boolean>
}

type FeaturedRow = typeof featuredProducts.$inferSelect
const iso = (value: string) => new Date(value).toISOString()
const isoOrNull = (value: string | null) => (value ? new Date(value).toISOString() : null)

const toFeaturedPublic = (row: FeaturedRow): FeaturedProductPublicDto => ({
  id: row.id,
  slug: row.slug,
  title: { id: row.titleId, en: row.titleEn },
  description: { id: row.descriptionId, en: row.descriptionEn },
  url: row.url ? row.url : null,
})

const toFeaturedAdmin = (row: FeaturedRow, now: Date): FeaturedProductAdminDto => {
  const startAt = isoOrNull(row.startAt)
  const endAt = isoOrNull(row.endAt)
  return {
    ...toFeaturedPublic(row),
    startAt,
    endAt,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    state: featuredProductState({ enabled: row.enabled, startAt, endAt }, now),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }
}

const featuredValues = (input: FeaturedProductInput) => ({
  slug: input.slug,
  titleId: input.titleId,
  titleEn: input.titleEn,
  descriptionId: input.descriptionId,
  descriptionEn: input.descriptionEn,
  url: input.url,
  startAt: input.startAt,
  endAt: input.endAt,
  enabled: input.enabled,
  sortOrder: input.sortOrder,
})

const toSharePreview = (row: typeof sharePreviews.$inferSelect): SharePreviewDto => ({
  id: row.id,
  path: row.path,
  title: row.title,
  description: row.description,
  imageUrl: row.imageUrl,
  updatedAt: iso(row.updatedAt),
})

const toQr = (row: typeof qrCodes.$inferSelect): QrCodeDto => ({
  id: row.id,
  name: row.name,
  targetUrl: row.targetUrl,
  foreground: row.foreground,
  background: row.background,
  logoDataUrl: row.logoDataUrl,
  logoScale: row.logoScale,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
})

export const createAdminToolsRepository = (database: typeof defaultDb = defaultDb): AdminToolsRepository => ({
  async listActiveFeatured(now = new Date()) {
    const rows = await database.select().from(featuredProducts).orderBy(asc(featuredProducts.sortOrder), asc(featuredProducts.titleId))
    return rows
      .filter((row) => featuredProductState({ enabled: row.enabled, startAt: isoOrNull(row.startAt), endAt: isoOrNull(row.endAt) }, now) === 'active')
      .map(toFeaturedPublic)
  },

  async listFeaturedAdmin(now = new Date()) {
    const rows = await database.select().from(featuredProducts).orderBy(asc(featuredProducts.sortOrder), asc(featuredProducts.titleId))
    return rows.map((row) => toFeaturedAdmin(row, now))
  },

  async createFeatured(input) {
    const [row] = await database.insert(featuredProducts).values(featuredValues(input)).returning()
    return toFeaturedAdmin(row, new Date())
  },

  async updateFeatured(id, input) {
    const [row] = await database
      .update(featuredProducts)
      .set({ ...featuredValues(input), updatedAt: sql`now()` })
      .where(eq(featuredProducts.id, id))
      .returning()
    return row ? toFeaturedAdmin(row, new Date()) : null
  },

  async removeFeatured(id) {
    const rows = await database.delete(featuredProducts).where(eq(featuredProducts.id, id)).returning({ id: featuredProducts.id })
    return rows.length > 0
  },

  async getSharePreview(path) {
    const [row] = await database.select().from(sharePreviews).where(eq(sharePreviews.path, path)).limit(1)
    return row ? toSharePreview(row) : null
  },

  async listSharePreviews() {
    const rows = await database.select().from(sharePreviews).orderBy(asc(sharePreviews.path))
    return rows.map(toSharePreview)
  },

  async saveSharePreview(input) {
    const [row] = await database
      .insert(sharePreviews)
      .values(input)
      .onConflictDoUpdate({
        target: sharePreviews.path,
        set: { title: input.title, description: input.description, imageUrl: input.imageUrl, updatedAt: sql`now()` },
      })
      .returning()
    return toSharePreview(row)
  },

  async removeSharePreview(id) {
    const rows = await database.delete(sharePreviews).where(eq(sharePreviews.id, id)).returning({ id: sharePreviews.id })
    return rows.length > 0
  },

  async recordPageView(path, newSession, now = new Date()) {
    const day = jakartaDay(now)
    await database
      .insert(pageViewDaily)
      .values({ path, day, views: 1, sessions: newSession ? 1 : 0, lastVisitAt: now.toISOString() })
      .onConflictDoUpdate({
        target: [pageViewDaily.path, pageViewDaily.day],
        set: {
          views: sql`${pageViewDaily.views} + 1`,
          sessions: sql`${pageViewDaily.sessions} + ${newSession ? 1 : 0}`,
          lastVisitAt: now.toISOString(),
        },
      })
  },

  async listTrafficRows() {
    const rows = await database.select().from(pageViewDaily).orderBy(desc(pageViewDaily.day))
    return rows.map((row) => ({
      path: row.path,
      day: row.day,
      views: row.views,
      sessions: row.sessions,
      lastVisitAt: iso(row.lastVisitAt),
    }))
  },

  async listQrCodes() {
    const rows = await database.select().from(qrCodes).orderBy(desc(qrCodes.createdAt))
    return rows.map(toQr)
  },

  async createQrCode(input) {
    const [row] = await database.insert(qrCodes).values(input).returning()
    return toQr(row)
  },

  async updateQrCode(id, input) {
    const [row] = await database.update(qrCodes).set({ ...input, updatedAt: sql`now()` }).where(eq(qrCodes.id, id)).returning()
    return row ? toQr(row) : null
  },

  async removeQrCode(id) {
    const rows = await database.delete(qrCodes).where(eq(qrCodes.id, id)).returning({ id: qrCodes.id })
    return rows.length > 0
  },
})
