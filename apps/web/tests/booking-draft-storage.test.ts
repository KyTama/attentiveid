import { describe, expect, it } from 'vitest'
import { DRAFT_TTL_MS, parseDraft, serializeDraft } from '../src/features/booking/draft-storage'

const form = { name: 'Sari', phone: '0812', email: 's@example.com', concern: 'anxiety', concernNote: 'private story about my health', isCrisisManual: true, step: 3 }

describe('booking draft storage', () => {
  it('never saves the health story or the crisis tick, but keeps the rest', () => {
    const saved = serializeDraft(form, 1_000)
    expect(saved).not.toContain('private story')
    expect(saved).not.toContain('isCrisisManual')
    expect(parseDraft<typeof form>(saved, 2_000)).toEqual({ name: 'Sari', phone: '0812', email: 's@example.com', concern: 'anxiety', step: 3 })
  })

  it('forgets a draft after a day', () => {
    const saved = serializeDraft(form, 1_000)
    expect(parseDraft(saved, 1_000 + DRAFT_TTL_MS - 1)).not.toBeNull()
    expect(parseDraft(saved, 1_000 + DRAFT_TTL_MS + 1)).toBeNull()
  })

  it('drops a draft from the older version (no expiry, with health details), and damaged ones', () => {
    expect(parseDraft(JSON.stringify(form))).toBeNull()
    expect(parseDraft('not json')).toBeNull()
    expect(parseDraft(null)).toBeNull()
    expect(parseDraft(JSON.stringify({ savedAt: 1, data: 'x' }), 2)).toBeNull()
  })

  it('strips the sensitive fields even if an old or tampered draft carries them', () => {
    const tampered = JSON.stringify({ savedAt: 5, data: { name: 'A', concernNote: 'secret', isCrisisManual: true } })
    expect(parseDraft(tampered, 10)).toEqual({ name: 'A' })
  })
})
