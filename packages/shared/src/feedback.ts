/** Bug reports and suggestions about the website, sent from /feedback and read by the owner account. */

export const FEEDBACK_KINDS = ['bug', 'suggestion'] as const
export type FeedbackKind = typeof FEEDBACK_KINDS[number]

export const FEEDBACK_NAME_MAX = 80
export const FEEDBACK_MESSAGE_MIN = 10
export const FEEDBACK_MESSAGE_MAX = 2000
export const FEEDBACK_PAGE_MAX = 200

export interface FeedbackSubmission {
  kind: FeedbackKind
  name: string
  message: string
  /** Which page it is about (free text or a path); empty when not given. */
  page: string
}

export interface FeedbackReport extends FeedbackSubmission {
  id: string
  createdAt: string
  /** When the owner marked it done; null while it is open. */
  doneAt: string | null
}

export type FeedbackField = keyof FeedbackSubmission
export type FeedbackErrors = Partial<Record<FeedbackField, string>>

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const validateFeedback = (input: unknown): { ok: true; value: FeedbackSubmission } | { ok: false; errors: FeedbackErrors } => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: FeedbackErrors = {}
  const kind = str(raw.kind) as FeedbackKind
  const name = str(raw.name)
  const message = str(raw.message)
  const page = str(raw.page)
  if (!FEEDBACK_KINDS.includes(kind)) errors.kind = 'Pilih jenis laporan.'
  if (name.length < 2) errors.name = 'Nama wajib diisi.'
  else if (name.length > FEEDBACK_NAME_MAX) errors.name = `Maks ${FEEDBACK_NAME_MAX} karakter.`
  if (message.length < FEEDBACK_MESSAGE_MIN) errors.message = `Ceritakan sedikit lebih lengkap (min ${FEEDBACK_MESSAGE_MIN} karakter).`
  else if (message.length > FEEDBACK_MESSAGE_MAX) errors.message = `Maks ${FEEDBACK_MESSAGE_MAX} karakter.`
  if (page.length > FEEDBACK_PAGE_MAX) errors.page = `Maks ${FEEDBACK_PAGE_MAX} karakter.`
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { kind, name, message, page } }
}

/** One released change of the website, listed in the portal's update history. */
export interface UpdateLogEntry {
  id: string
  /** ISO date and time of the change. */
  at: string
  author: string
  title: string
  /** Short description; may be empty. */
  detail: string
}
