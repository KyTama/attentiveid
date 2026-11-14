import { describe, expect, it } from 'bun:test'
import {
  buildSciBriefAccessRequest,
  formatSciBriefMonth,
  isSciBriefPublic,
  slugifySciBrief,
  validateSciBriefInput,
} from './sci-brief'

const valid = {
  titleId: 'Menjadi Disukai',
  titleEn: 'Being Liked',
  summaryId: 'Ringkasan singkat.',
  summaryEn: 'A short summary.',
  periodMonth: '2026-09',
  releaseAt: '2026-09-01T00:00:00Z',
  status: 'draft',
}

describe('validateSciBriefInput', () => {
  it('accepts a complete brief, derives the slug and defaults to 3 preview pages', () => {
    const result = validateSciBriefInput(valid)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.slug).toBe('being-liked')
      expect(result.value.previewPages).toBe(3)
      expect(result.value.releaseAt).toBe('2026-09-01T00:00:00.000Z')
    }
  })

  it('copies the Indonesian text when English is empty', () => {
    const result = validateSciBriefInput({ ...valid, titleEn: '', summaryEn: '' })
    expect(result.ok && result.value.titleEn).toBe('Menjadi Disukai')
    expect(result.ok && result.value.summaryEn).toBe('Ringkasan singkat.')
  })

  it('rejects bad month, date, status, preview pages and slug', () => {
    const result = validateSciBriefInput({
      ...valid,
      periodMonth: '2026-13',
      releaseAt: 'soon',
      status: 'live',
      previewPages: 20,
      slug: 'Bad Slug',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['periodMonth', 'previewPages', 'releaseAt', 'slug', 'status'])
    }
  })

  it('requires a title and summary', () => {
    const result = validateSciBriefInput({ ...valid, titleId: '', summaryId: '' })
    expect(result.ok).toBe(false)
  })
})

describe('isSciBriefPublic', () => {
  const now = new Date('2026-10-15T00:00:00Z')
  it('needs published status and a passed release date', () => {
    expect(isSciBriefPublic({ status: 'published', releaseAt: '2026-10-01T00:00:00Z' }, now)).toBe(true)
    expect(isSciBriefPublic({ status: 'published', releaseAt: '2026-11-01T00:00:00Z' }, now)).toBe(false)
    expect(isSciBriefPublic({ status: 'draft', releaseAt: '2026-10-01T00:00:00Z' }, now)).toBe(false)
  })
})

describe('helpers', () => {
  it('slugifies titles', () => {
    expect(slugifySciBrief('Nov · More Than Mine!')).toBe('nov-more-than-mine')
  })

  it('formats the covered month', () => {
    expect(formatSciBriefMonth('2026-11', 'en')).toBe('November 2026')
    expect(formatSciBriefMonth('2026-11', 'id')).toBe('November 2026')
  })

  it('builds email and WhatsApp request links containing the title', () => {
    const request = buildSciBriefAccessRequest({
      title: 'Being Liked',
      periodMonth: '2026-09',
      locale: 'en',
      email: 'contact@attentiveid.com',
      whatsappNumber: '+62 851-5641-0912',
    })
    expect(request.emailUrl.startsWith('mailto:contact@attentiveid.com?subject=')).toBe(true)
    expect(request.whatsappUrl.startsWith('https://wa.me/6285156410912?text=')).toBe(true)
    expect(decodeURIComponent(request.whatsappUrl)).toContain('Being Liked')
    expect(request.body).toContain('September 2026')
  })
})
