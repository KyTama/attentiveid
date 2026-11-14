import { describe, expect, it } from 'vitest'
import type { SciBriefPublicDto } from '@attentiveid/shared'
import { buildSciBriefChips } from '@/features/sci-brief/use-hero-chips'

const brief = (periodMonth: string, releaseAt: string, en: string): SciBriefPublicDto => ({
  id: periodMonth,
  slug: en,
  title: { id: `${en} ID`, en },
  summary: { id: '', en: '' },
  periodMonth,
  releaseAt,
  totalPages: 10,
  previewPages: 3,
  previewUrl: null,
})

describe('buildSciBriefChips', () => {
  const briefs = [
    brief('2026-09', '2026-09-01T00:00:00Z', 'A'),
    brief('2026-12', '2026-12-01T00:00:00Z', 'D'),
    brief('2026-10', '2026-10-01T00:00:00Z', 'B'),
    brief('2026-11', '2026-11-01T00:00:00Z', 'C'),
  ]
  it('uses the three newest briefs, oldest of them first', () => {
    expect(buildSciBriefChips(briefs, false)).toEqual(['Oct · B', 'Nov · C', 'Dec · D'])
  })
  it('uses the Indonesian title in Indonesian', () => {
    expect(buildSciBriefChips(briefs, true)[2]).toMatch(/· D ID$/)
  })
})
