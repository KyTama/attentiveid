export interface SitemapSource {
  psychologistSlugs: string[]
  articleSlugs: string[]
  sciBriefSlugs: string[]
}

interface SitemapEntry {
  path: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/psychologists', changefreq: 'daily', priority: '0.9' },
  { path: '/articles', changefreq: 'weekly', priority: '0.8' },
  { path: '/sci-brief', changefreq: 'monthly', priority: '0.7' },
]

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** Builds sitemap.xml from what is currently public in the portal data. */
export const buildSitemapXml = (origin: string, source: SitemapSource): string => {
  const base = origin.replace(/\/+$/, '')
  const entries: SitemapEntry[] = [
    ...STATIC_ENTRIES,
    ...source.psychologistSlugs.map((slug) => ({ path: `/psychologists/${slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...source.articleSlugs.map((slug) => ({ path: `/articles/${slug}`, changefreq: 'monthly' as const, priority: '0.6' })),
    ...source.sciBriefSlugs.map((slug) => ({ path: `/sci-brief/${slug}`, changefreq: 'monthly' as const, priority: '0.6' })),
  ]
  const urls = entries
    .map((entry) => `  <url>\n    <loc>${escapeXml(base + entry.path)}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
