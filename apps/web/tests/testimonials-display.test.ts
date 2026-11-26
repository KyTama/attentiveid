import { describe, expect, it } from 'vitest'
import { homepageTestimonials, testimonialKey, trimPublicTestimonials, type LandingContentMutation } from '@attentiveid/shared'

const items = Array.from({ length: 100 }, (_, position) => ({ id: `s${position}`, position, title: { id: `t${position}`, en: 't' }, description: { id: 'd', en: 'd' } }))

describe('testimonials on the homepage', () => {
  it('shows the first ones that are not hidden, up to the chosen number', () => {
    expect(homepageTestimonials({ items }).length).toBe(24)
    expect(homepageTestimonials({ items, display: { homepageCount: 4, hiddenKeys: [testimonialKey(items[0]!), testimonialKey(items[2]!)] } }).map((item) => item.id)).toEqual(['s1', 's3', 's4', 's5'])
  })

  it('sends visitors only those', () => {
    const section = { key: 'clientStories', items, display: { homepageCount: 5, hiddenKeys: [testimonialKey(items[0]!)] } }
    const sent = trimPublicTestimonials({ content: { sections: [section] } as unknown as LandingContentMutation }).content.sections[0] as unknown as typeof section
    expect(sent.items.map((item) => [item.id, item.position])).toEqual([['s1', 0], ['s2', 1], ['s3', 2], ['s4', 3], ['s5', 4]])
    expect(sent.display).toBeUndefined()
  })

  it('never sends a hidden one, even when fewer than three are left, and that payload is still valid', () => {
    const few = items.slice(0, 4)
    const section = { key: 'clientStories', items: few, display: { homepageCount: 3, hiddenKeys: [testimonialKey(few[0]!), testimonialKey(few[1]!)] } }
    for (const stored of [section, { ...section, display: { homepageCount: 3, hiddenKeys: few.map(testimonialKey) } }]) {
      const sent = trimPublicTestimonials({ content: { sections: [stored] } as unknown as LandingContentMutation }).content.sections[0] as unknown as typeof section
      const hidden = new Set(stored.display.hiddenKeys)
      expect(sent.items.filter((item) => hidden.has(testimonialKey(item)))).toEqual([])
      expect(sent.display).toBeUndefined()
    }
  })
})
