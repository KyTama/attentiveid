import { describe, expect, it } from 'bun:test'
import { canAssignRole, canManageAccount, MIN_STAFF_PASSWORD_LENGTH } from './user-management-policy'

const admin = { id: 'a1', role: 'admin' as const }
const superadmin = { id: 's1', role: 'superadmin' as const }

describe('who may manage which staff account', () => {
  it('lets only a superadmin create a superadmin', () => {
    expect(canAssignRole(admin, 'superadmin')).toMatchObject({ ok: false, status: 403 })
    expect(canAssignRole(admin, 'admin')).toEqual({ ok: true })
    expect(canAssignRole(admin, 'psychologist')).toEqual({ ok: true })
    expect(canAssignRole(superadmin, 'superadmin')).toEqual({ ok: true })
  })

  it('keeps an admin away from superadmin accounts (suspend and password reset)', () => {
    const target = { id: 's2', role: 'superadmin' as const }
    expect(canManageAccount(admin, target, 'reset-password')).toMatchObject({ ok: false, status: 403 })
    expect(canManageAccount(admin, target, 'status')).toMatchObject({ ok: false, status: 403 })
    expect(canManageAccount(superadmin, target, 'reset-password')).toEqual({ ok: true })
    expect(canManageAccount(superadmin, target, 'status')).toEqual({ ok: true })
  })

  it('lets an admin manage admins and psychologists, but nobody suspends their own account', () => {
    expect(canManageAccount(admin, { id: 'p1', role: 'psychologist' }, 'reset-password')).toEqual({ ok: true })
    expect(canManageAccount(admin, { id: 'a2', role: 'admin' }, 'status')).toEqual({ ok: true })
    expect(canManageAccount(admin, { id: 'a1', role: 'admin' }, 'status')).toMatchObject({ ok: false, status: 400 })
    expect(canManageAccount(superadmin, { id: 's1', role: 'superadmin' }, 'status')).toMatchObject({ ok: false, status: 400 })
  })

  it('asks for a long password', () => {
    expect(MIN_STAFF_PASSWORD_LENGTH).toBeGreaterThanOrEqual(12)
  })
})
