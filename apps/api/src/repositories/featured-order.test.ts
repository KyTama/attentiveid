import { describe, expect, it } from 'bun:test'
import { placeInFeaturedOrder } from './psychologists.repository'

const others = [
  { id: 'gita', featuredOrder: 1 },
  { id: 'ratri', featuredOrder: 2 },
  { id: 'syazka', featuredOrder: 3 },
]

describe('placeInFeaturedOrder', () => {
  it('puts a profile on a taken number and moves its holder down one place', () => {
    expect(placeInFeaturedOrder(others, 'haykal', 2)).toEqual(['gita', 'haykal', 'ratri', 'syazka'])
  })

  it('goes first for a number below the first, and last for a number above the last', () => {
    expect(placeInFeaturedOrder(others, 'haykal', 0)).toEqual(['haykal', 'gita', 'ratri', 'syazka'])
    expect(placeInFeaturedOrder(others, 'haykal', 40)).toEqual(['gita', 'ratri', 'syazka', 'haykal'])
  })

  it('handles gaps in the existing numbers', () => {
    expect(placeInFeaturedOrder([{ id: 'a', featuredOrder: 1 }, { id: 'b', featuredOrder: 5 }], 'c', 3)).toEqual(['a', 'c', 'b'])
  })

  it('never lists the profile twice when it is already featured', () => {
    expect(placeInFeaturedOrder([{ id: 'haykal', featuredOrder: 1 }, ...others.slice(1)], 'haykal', 3)).toEqual(['ratri', 'haykal', 'syazka'])
  })
})
