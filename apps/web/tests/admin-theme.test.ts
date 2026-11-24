import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/features/dashboard/admin-theme'

describe('resolveTheme', () => {
  it('keeps an explicit choice whatever the device prefers', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
  it('follows the device when the choice is system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})
