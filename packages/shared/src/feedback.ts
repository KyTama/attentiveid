/** Bug reports and suggestions about the website, sent from /feedback and read by the owner account. */

export const FEEDBACK_KINDS = ['bug', 'suggestion'] as const
export type FeedbackKind = typeof FEEDBACK_KINDS[number]

export const FEEDBACK_NAME_MAX = 80
export const FEEDBACK_MESSAGE_MIN = 10
export const FEEDBACK_MESSAGE_MAX = 2000
export const FEEDBACK_PAGE_MAX = 200

export const FEEDBACK_MAX_FILES = 3
export const FEEDBACK_FILE_MAX_BYTES = 5 * 1024 * 1024
/** All files of one report together (the server refuses requests over 8 MB). */
export const FEEDBACK_TOTAL_MAX_BYTES = 7 * 1024 * 1024

/** Allowed file endings and the type each is saved as. */
export const FEEDBACK_FILE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
}

export const feedbackFileExtension = (name: string) => (name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '')

/** Why these files cannot be sent, or null when they can. */
export const feedbackFilesProblem = (files: Array<{ name: string; size: number }>): 'count' | 'type' | 'size' | 'total' | 'empty' | null => {
  if (files.length > FEEDBACK_MAX_FILES) return 'count'
  if (files.some((file) => !Object.hasOwn(FEEDBACK_FILE_TYPES, feedbackFileExtension(file.name)))) return 'type'
  if (files.some((file) => file.size === 0)) return 'empty'
  if (files.some((file) => file.size > FEEDBACK_FILE_MAX_BYTES)) return 'size'
  if (files.reduce((sum, file) => sum + file.size, 0) > FEEDBACK_TOTAL_MAX_BYTES) return 'total'
  return null
}

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
  files: Array<{ name: string; size: number }>
  /** The report's folder in Drive; null until it has been copied there. */
  driveFolderId: string | null
  /** Why the last copy to Drive failed. */
  driveError: string | null
}

export type FeedbackField = keyof FeedbackSubmission | 'files'
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
