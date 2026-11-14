import { Elysia } from 'elysia'
import { and, eq, isNotNull, lte } from 'drizzle-orm'
import { articles, psychologists, sciBriefs } from '../db/schema'
import { buildSitemapXml } from '../services/sitemap'

export interface SitemapRoutesDependencies {
  db?: any
  siteOrigin: string
  now?: () => Date
}

/** Public sitemap built from the portal data, so new content appears without a code change. */
export const createSitemapRoutes = (dependencies: SitemapRoutesDependencies) =>
  new Elysia({ name: 'sitemap-routes' }).get('/api/content/sitemap.xml', async ({ set }) => {
    const db = dependencies.db ?? (await import('../db')).db
    const now = (dependencies.now ?? (() => new Date()))()
    try {
      const [psychologistRows, articleRows, briefRows] = await Promise.all([
        db.select({ slug: psychologists.slug }).from(psychologists).where(eq(psychologists.status, 'active')).orderBy(psychologists.featuredOrder, psychologists.name),
        db.select({ slug: articles.slug }).from(articles).where(and(eq(articles.status, 'published'), isNotNull(articles.publishedRevisionId))).orderBy(articles.slug),
        db.select({ slug: sciBriefs.slug }).from(sciBriefs).where(and(eq(sciBriefs.status, 'published'), lte(sciBriefs.releaseAt, now.toISOString()))).orderBy(sciBriefs.slug),
      ])
      set.headers['content-type'] = 'application/xml; charset=utf-8'
      set.headers['cache-control'] = 'public, max-age=300'
      return buildSitemapXml(dependencies.siteOrigin, {
        psychologistSlugs: psychologistRows.map((row: { slug: string }) => row.slug),
        articleSlugs: articleRows.map((row: { slug: string }) => row.slug),
        sciBriefSlugs: briefRows.map((row: { slug: string }) => row.slug),
      })
    } catch {
      set.status = 503
      return 'sitemap unavailable'
    }
  })
