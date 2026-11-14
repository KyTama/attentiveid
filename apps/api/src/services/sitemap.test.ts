import { describe, expect, it } from 'bun:test'
import { buildSitemapXml } from './sitemap'

describe('buildSitemapXml', () => {
  it('lists static pages and every public slug, escaping and trimming the origin', () => {
    const xml = buildSitemapXml('https://attentiveid.com/', {
      psychologistSlugs: ['ella'],
      articleSlugs: ['a&b'],
      sciBriefSlugs: ['being-liked'],
    })
    expect(xml).toContain('<loc>https://attentiveid.com/</loc>')
    expect(xml).toContain('<loc>https://attentiveid.com/psychologists/ella</loc>')
    expect(xml).toContain('<loc>https://attentiveid.com/articles/a&amp;b</loc>')
    expect(xml).toContain('<loc>https://attentiveid.com/sci-brief/being-liked</loc>')
    expect(xml).not.toContain('//psychologists')
  })
})
