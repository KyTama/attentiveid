import { describe, expect, it } from 'bun:test'
import { validateSciBriefInput, validateTeamMember, type TeamMemberDto } from '@attentiveid/shared'

describe('team member input', () => {
  it('accepts a name and a team, copying the Indonesian role to English', () => {
    const result = validateTeamMember({ team: 'advisor', name: ' Sari ', roleId: 'Penasihat' })
    expect(result.ok && result.value).toEqual({ team: 'advisor', name: 'Sari', roleId: 'Penasihat', roleEn: 'Penasihat', photoUrl: null, sortOrder: 0, visible: true } satisfies Omit<TeamMemberDto, 'id'>)
  })

  it('rejects an unknown team and a photo address that could run script or leave the site by protocol', () => {
    for (const photoUrl of ['javascript:alert(1)', 'http://x.test/a.jpg', '//x.test/a.jpg', '/\\evil.example/a.png', '/\t/evil.example/a.png']) {
      const result = validateTeamMember({ team: 'sales', name: 'Sari', photoUrl })
      expect(result.ok ? [] : Object.keys(result.errors).sort()).toEqual(['photoUrl', 'team'])
    }
  })
})

describe('sci-brief free flag', () => {
  const base = { titleId: 'Judul', summaryId: 'Ringkas', periodMonth: '2026-11', releaseAt: '2026-11-01T00:00:00Z' }
  it('stays locked unless it is exactly true', () => {
    for (const isFree of [undefined, 'true', 1, false]) {
      const result = validateSciBriefInput({ ...base, isFree })
      expect(result.ok && result.value.isFree).toBe(false)
    }
    const free = validateSciBriefInput({ ...base, isFree: true })
    expect(free.ok && free.value.isFree).toBe(true)
  })
})
