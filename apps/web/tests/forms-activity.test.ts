import { describe, expect, it } from 'vitest'
import type { AssessmentListItem } from '@/features/assessments/service'
import { mergeActivity, summarizeForm } from '@/features/dashboard/forms-activity'

const item = (id: string, createdAt: string): AssessmentListItem => ({
  id, code: `C-${id}`, instrument: 'mhcu', name: `N${id}`, age: 30, email: 'a@b.c', phone: '1', level: 2,
  status: 'new', researchConsent: true, createdAt,
})
const NOW = Date.parse('2026-11-24T12:00:00Z')

describe('forms activity', () => {
  it('counts the last 7 days and finds the newest', () => {
    const summary = summarizeForm('mhcu', [item('1', '2026-11-23T10:00:00Z'), item('2', '2026-11-10T10:00:00Z'), item('3', '2026-11-20T10:00:00Z')], NOW)
    expect(summary).toEqual({ key: 'mhcu', total: 3, last7Days: 2, newest: '2026-11-23T10:00:00.000Z' })
  })
  it('handles an empty form', () => {
    expect(summarizeForm('gsc', [], NOW)).toEqual({ key: 'gsc', total: 0, last7Days: 0, newest: null })
  })
  it('merges both forms newest first and respects the limit', () => {
    const merged = mergeActivity({ mhcu: [item('1', '2026-11-23T10:00:00Z')], gsc: [item('2', '2026-11-24T08:00:00Z'), item('3', '2026-11-01T08:00:00Z')] }, 2)
    expect(merged.map((entry) => `${entry.key}:${entry.id}`)).toEqual(['gsc:2', 'mhcu:1'])
  })
})
