import { describe, expect, it } from 'vitest'
import { isSameOrder, moveToPosition } from '../src/features/psychologists/featured-order'

describe('moveToPosition', () => {
  const list = ['gita', 'ratri', 'haykal', 'syazka']

  it('puts the profile in the chosen place and shifts the others down', () => {
    expect(moveToPosition(list, 'haykal', 2)).toEqual(['gita', 'haykal', 'ratri', 'syazka'])
  })

  it('moves a profile down without leaving a gap', () => {
    expect(moveToPosition(list, 'gita', 3)).toEqual(['ratri', 'haykal', 'gita', 'syazka'])
  })

  it('clamps positions that are out of range', () => {
    expect(moveToPosition(list, 'ratri', 99)).toEqual(['gita', 'haykal', 'syazka', 'ratri'])
    expect(moveToPosition(list, 'syazka', 0)).toEqual(['syazka', 'gita', 'ratri', 'haykal'])
    expect(moveToPosition(list, 'syazka', Number.NaN)).toEqual(['syazka', 'gita', 'ratri', 'haykal'])
  })

  it('leaves the list alone for an unknown profile or the same position', () => {
    expect(moveToPosition(list, 'nobody', 2)).toEqual(list)
    expect(moveToPosition(list, 'ratri', 2)).toEqual(list)
  })

  it('compares orders', () => {
    expect(isSameOrder(list, [...list])).toBe(true)
    expect(isSameOrder(list, moveToPosition(list, 'haykal', 1))).toBe(false)
  })
})
