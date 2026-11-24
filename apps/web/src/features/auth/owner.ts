import type { UserDto } from '@attentiveid/shared'
import { canAccessExperimental } from '../experimental/access'

/** The owner account (superadmin on the owner e-mail list). Only this account sees delete buttons; the API checks it again. */
export const isOwnerUser = (user: Pick<UserDto, 'role' | 'email'> | null | undefined): boolean =>
  user?.role === 'superadmin' && canAccessExperimental(user.email)
