/**
 * Owner account(s) allowed to use the owner-only tools (traffic monitor, QR generator, Experimental).
 * Mirrors the web allow-list; override with EXPERIMENTAL_EMAILS (comma-separated).
 */
const parse = (raw: string | undefined) =>
  (raw ? raw.split(',') : ['nico.alex.ha@gmail.com']).map((email) => email.trim().toLowerCase()).filter(Boolean)

export const isOwnerEmail = (email: string | null | undefined, owners: string[] = parse(process.env.EXPERIMENTAL_EMAILS)): boolean =>
  Boolean(email) && owners.includes((email as string).trim().toLowerCase())

/** The owner account: a superadmin whose e-mail is on the owner list. Only this account may delete records. */
export const isOwnerUser = (user: { role?: string; email?: string | null } | null | undefined): boolean =>
  user?.role === 'superadmin' && isOwnerEmail(user.email)
