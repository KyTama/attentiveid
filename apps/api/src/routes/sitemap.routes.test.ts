import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { createSitemapRoutes } from './sitemap.routes'

const rowsByCall = [[{ slug: 'ella' }], [{ slug: 'first-article' }], [{ slug: 'being-liked' }]]

const fakeDb = () => {
  let call = 0
  return {
    select: () => {
      const rows = rowsByCall[call++]
      const chain: any = { from: () => chain, where: () => chain, orderBy: () => Promise.resolve(rows) }
      return chain
    },
  }
}

describe('GET /api/content/sitemap.xml', () => {
  it('serves XML listing public psychologists, articles and Sci-Briefs', async () => {
    const app = new Elysia().use(createSitemapRoutes({ db: fakeDb(), siteOrigin: 'https://attentiveid.com' }))
    const response = await app.handle(new Request('http://localhost/api/content/sitemap.xml'))
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/xml')
    expect(body).toContain('https://attentiveid.com/psychologists/ella')
    expect(body).toContain('https://attentiveid.com/articles/first-article')
    expect(body).toContain('https://attentiveid.com/sci-brief/being-liked')
  })

  it('answers 503 when the database fails', async () => {
    const db = { select: () => { throw new Error('down') } }
    const app = new Elysia().use(createSitemapRoutes({ db, siteOrigin: 'https://attentiveid.com' }))
    const response = await app.handle(new Request('http://localhost/api/content/sitemap.xml'))
    expect(response.status).toBe(503)
  })
})
