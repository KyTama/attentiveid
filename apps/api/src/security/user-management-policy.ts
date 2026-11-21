import type { UserRole } from '@attentiveid/shared'

/**
 * Who may change which staff account. An admin runs the team, but only a superadmin may create or touch another
 * superadmin: otherwise any admin could make themselves superadmin or take over a superadmin's account by resetting its password.
 */

export const MIN_STAFF_PASSWORD_LENGTH = 12

export interface Actor {
  id: string
  role: UserRole
}

export interface Target {
  id: string
  role: UserRole
}

export type Decision = { ok: true } | { ok: false; status: 400 | 403; message: string }

const allowed: Decision = { ok: true }

/** May this person create an account with this role? */
export const canAssignRole = (actor: Actor, role: UserRole): Decision =>
  role === 'superadmin' && actor.role !== 'superadmin'
    ? { ok: false, status: 403, message: 'Hanya superadmin yang dapat membuat akun superadmin.' }
    : allowed

/** May this person suspend/activate this account or reset its password? */
export const canManageAccount = (actor: Actor, target: Target, action: 'status' | 'reset-password'): Decision => {
  if (target.role === 'superadmin' && actor.role !== 'superadmin') {
    return { ok: false, status: 403, message: 'Hanya superadmin yang dapat mengubah akun superadmin.' }
  }
  if (action === 'status' && actor.id === target.id) {
    return { ok: false, status: 400, message: 'Kamu tidak dapat menonaktifkan akunmu sendiri.' }
  }
  return allowed
}
