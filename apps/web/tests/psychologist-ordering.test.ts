import { describe, expect, it } from 'vitest'
import { hasCompleteBio, orderForDirectory } from '../src/features/psychologists/ordering'

const longBio = 'x'.repeat(400)
const rec = (slug: string, featuredOrder: number | null, complete: boolean) => ({
  slug,
  featuredOrder,
  shortBio: complete ? 'Short bio' : undefined,
  biography: complete ? longBio : 'One line.',
})

describe('directory order', () => {
  it('treats a bio as complete only with a short bio and a real biography', () => {
    expect(hasCompleteBio({ shortBio: 'a', biography: longBio })).toBe(true)
    expect(hasCompleteBio({ shortBio: 'a', biography: 'One line.' })).toBe(false)
    expect(hasCompleteBio({ biography: longBio })).toBe(false)
  })

  it('follows the manual Featured order, even when a bio is thin', () => {
    const input = [rec('c', 3, true), rec('a', 1, false), rec('b', 2, true)]
    expect(orderForDirectory(input).map((r) => r.slug)).toEqual(['a', 'b', 'c'])
  })

  it('puts profiles without a Featured number after the featured ones, complete bios first', () => {
    const input = [rec('thin', null, false), rec('full', null, true), rec('f2', 2, false), rec('f1', 1, false)]
    expect(orderForDirectory(input).map((r) => r.slug)).toEqual(['f1', 'f2', 'full', 'thin'])
  })

  it('keeps the incoming order inside a group', () => {
    const input = [rec('z', null, true), rec('y', null, true)]
    expect(orderForDirectory(input).map((r) => r.slug)).toEqual(['z', 'y'])
  })
})
