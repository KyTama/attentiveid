import { describe, expect, it } from 'vitest'
import { feedbackPeriods } from '../src/features/feedback/periods'

const now = new Date('2026-11-26T20:00:00Z') // 27 Nov in Jakarta

describe('feedback chart periods', () => {
  it('counts per Jakarta day for a short history', () => {
    const { periods, weekly } = feedbackPeriods([{ kind: 'bug', createdAt: '2026-11-26T18:00:00Z' }, { kind: 'suggestion', createdAt: '2026-11-26T03:00:00Z' }], now)
    expect(weekly).toBe(false)
    expect(periods).toHaveLength(14)
    expect(periods.at(-1)).toEqual({ start: '2026-11-27', bug: 1, suggestion: 0 })
    expect(periods.at(-2)).toEqual({ start: '2026-11-26', bug: 0, suggestion: 1 })
  })

  it('switches to weeks once reports are older than two weeks', () => {
    const { periods, weekly } = feedbackPeriods([{ kind: 'bug', createdAt: '2026-10-01T03:00:00Z' }], now)
    expect(weekly).toBe(true)
    expect(periods).toHaveLength(12)
    expect(periods.reduce((sum, p) => sum + p.bug, 0)).toBe(1)
  })
})
