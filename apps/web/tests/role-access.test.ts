import { describe, expect, it } from 'vitest'
import { ACTION_ACCESS, PAGE_ACCESS, allowedFor, type Level } from '@/features/dashboard/role-access'

const rank: Record<Level, number> = { none: 0, own: 1, all: 2 }

describe('role access table', () => {
  const rows = [...PAGE_ACCESS, ...ACTION_ACCESS]

  it('has unique ids', () => {
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
  })

  it('never gives a psychologist more than an admin, or an admin more than a superadmin', () => {
    for (const row of rows) {
      expect(rank[row.admin], row.id).toBeGreaterThanOrEqual(rank[row.psychologist])
      expect(rank[row.superadmin], row.id).toBeGreaterThanOrEqual(rank[row.admin])
    }
  })

  it('keeps the money and release actions away from psychologists', () => {
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]))
    for (const id of ['a-mhcu-payment', 'a-mhcu-release', 'a-mhcu-assign', 'a-mhcu-settings', 'users']) {
      expect(byId[id].psychologist, id).toBe('none')
    }
  })

  it('lists only reachable pages for a psychologist', () => {
    const labels = allowedFor(PAGE_ACCESS, 'psychologist').map((row) => row.label)
    expect(labels).toContain('Dasbor MHCU')
    expect(labels).not.toContain('Manajemen Staff')
  })
})
