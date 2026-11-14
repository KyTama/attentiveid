import { describe, expect, it } from 'vitest'
import { hasCompleteBio, orderForDirectory } from '../src/features/psychologists/ordering'

const longBio = 'x'.repeat(400)
const rec = (slug: string, complete: boolean) => ({
  slug,
  shortBio: complete ? 'Short bio' : undefined,
  biography: complete ? longBio : 'One line.',
})

describe('directory order', () => {
  it('treats a bio as complete only with a short bio and a real biography', () => {
    expect(hasCompleteBio({ shortBio: 'a', biography: longBio })).toBe(true)
    expect(hasCompleteBio({ shortBio: 'a', biography: 'One line.' })).toBe(false)
    expect(hasCompleteBio({ biography: longBio })).toBe(false)
  })

  it('puts Ella, Syazka and Haykal first, then complete bios, then the rest', () => {
    const input = [
      rec('andri', false),
      rec('dinda', true),
      rec('haykal', true),
      rec('farah', false),
      rec('gisella', true),
      rec('mayda', true),
      rec('syazka', true),
    ]
    expect(orderForDirectory(input).map((r) => r.slug)).toEqual([
      'gisella',
      'syazka',
      'haykal',
      'dinda',
      'mayda',
      'andri',
      'farah',
    ])
  })

  it('keeps pinned psychologists on top even when their bio is incomplete', () => {
    expect(orderForDirectory([rec('dinda', true), rec('haykal', false)]).map((r) => r.slug)).toEqual(['haykal', 'dinda'])
  })
})
