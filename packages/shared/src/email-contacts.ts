/**
 * Contacts of the portal's Email menu: the shapes shared by the API and the screens, and the one place the input rules live.
 */

export const EMAIL_NAME_MAX = 120
export const EMAIL_PHONE_MAX = 40
export const EMAIL_ADDRESS_MAX = 254
export const EMAIL_CATEGORY_NAME_MAX = 40
export const EMAIL_CATEGORIES_PER_CONTACT = 10
/** Seeded by the migration; "client" is what a contact gets when no category is chosen. */
export const DEFAULT_EMAIL_CATEGORY = 'client'

export type EmailContactSource = 'manual' | 'import'

export interface EmailCategory {
  id: string
  name: string
  builtin: boolean
  /** Contacts that have this category (archived ones included). */
  count: number
}

export interface EmailContact {
  id: string
  email: string
  name: string
  phone: string
  categoryIds: string[]
  source: EmailContactSource
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EmailContactInput {
  email: string
  name: string
  phone: string
  categoryIds: string[]
}

export type EmailContactErrors = Partial<Record<keyof EmailContactInput, 'required' | 'invalid' | 'too_long' | 'too_many'>>

/** Lower-cased and trimmed; null when it is not one plain address (no display name, no list of addresses). */
export function normalizeContactEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (!email || email.length > EMAIL_ADDRESS_MAX) return null
  // Characters that would let one field carry a second address or a mail header are refused.
  return /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z0-9-]{2,}$/i.test(email) ? email : null
}

/** One form for 0812…, 62812… and +62 812…; empty when there are not enough digits to compare. */
export function normalizeContactPhone(value: unknown): string {
  if (typeof value !== 'string') return ''
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('62')) digits = `0${digits.slice(2)}`
  else if (digits.startsWith('8')) digits = `0${digits}`
  return digits.length >= 9 && digits.length <= 15 ? digits : ''
}

/** Single line, no control characters, outer and doubled spaces removed. */
export function cleanContactText(value: unknown): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function validateContact(raw: unknown):
  | { ok: true; value: EmailContactInput }
  | { ok: false; errors: EmailContactErrors } {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const errors: EmailContactErrors = {}

  const email = normalizeContactEmail(input.email)
  if (!email) errors.email = typeof input.email === 'string' && input.email.trim() ? 'invalid' : 'required'

  const name = cleanContactText(input.name)
  if (name.length > EMAIL_NAME_MAX) errors.name = 'too_long'

  const phone = cleanContactText(input.phone)
  if (phone.length > EMAIL_PHONE_MAX) errors.phone = 'too_long'
  else if (phone && !/^[+\d][\d\s().-]*$/.test(phone)) errors.phone = 'invalid'

  const ids = Array.isArray(input.categoryIds) ? input.categoryIds : []
  if (ids.some((id) => typeof id !== 'string')) errors.categoryIds = 'invalid'
  const categoryIds = [...new Set(ids.filter((id): id is string => typeof id === 'string'))]
  if (categoryIds.length > EMAIL_CATEGORIES_PER_CONTACT) errors.categoryIds = 'too_many'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { email: email!, name, phone, categoryIds } }
}

/** A category name, or null when empty or too long. ";" separates several categories in the Excel file, so it is not allowed. */
export function validateCategoryName(value: unknown): string | null {
  const name = cleanContactText(value)
  return name && name.length <= EMAIL_CATEGORY_NAME_MAX && !name.includes(';') ? name : null
}

/** A first guess for the name field, only from addresses that clearly spell one ("budi.santoso@…"); the person can change it. */
export function suggestNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length < 2 || parts.length > 4 || !parts.every((part) => /^[a-z]{2,}$/i.test(part))) return ''
  return parts.map((part) => part[0]!.toUpperCase() + part.slice(1).toLowerCase()).join(' ')
}

/* ------------------------------------------------------------ Excel import */

export const EMAIL_IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const EMAIL_IMPORT_MAX_ROWS = 10_000

export type EmailImportSheet = 'new' | 'existing'
export type EmailImportOverlapReason = 'email_exists' | 'email_archived' | 'email_in_file' | 'phone_exists' | 'phone_in_file'
export type EmailImportInvalidReason = 'email' | 'name' | 'phone' | 'category' | 'unknown_id'

export interface EmailImportRow {
  /** "new:5" or "existing:3": the sheet and the row number a person sees in Excel. */
  key: string
  sheet: EmailImportSheet
  row: number
  email: string
  name: string
  phone: string
  /** Category names. */
  categories: string[]
}

export interface EmailImportEdit extends EmailImportRow {
  contactId: string
  /** The contact's updatedAt when the file was checked; a later change stops this row. */
  version: string
  changed: Array<'email' | 'name' | 'phone' | 'categories'>
}

export interface EmailImportPlan {
  added: EmailImportRow[]
  edited: EmailImportEdit[]
  /** Same address or phone as a contact or another row. Only "phone" ones may be added anyway (a shared number). */
  overlapping: Array<EmailImportRow & { reason: EmailImportOverlapReason; canInclude: boolean }>
  invalid: Array<{ key: string; sheet: EmailImportSheet; row: number; email: string; reason: EmailImportInvalidReason }>
  /** Changed in the portal after the file was exported: never overwritten. */
  conflicts: EmailImportRow[]
  unchanged: number
  newCategories: string[]
}

export interface EmailImportResult {
  added: number
  updated: number
  skipped: number
}
