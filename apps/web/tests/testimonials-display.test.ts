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
})
