/**
 * Sci-Brief: monthly research digests with a public preview (first pages) and
 * a locked remainder that visitors request by email or WhatsApp.
 *
 * Shared by the public pages and portal (apps/web) and the API (apps/api).
 */

export const SCI_BRIEF_STATUSES = ['draft', 'published'] as const
export type SciBriefStatus = typeof SCI_BRIEF_STATUSES[number]

export const SCI_BRIEF_DEFAULT_PREVIEW_PAGES = 3
export const SCI_BRIEF_MAX_PREVIEW_PAGES = 10
export const SCI_BRIEF_MAX_PDF_BYTES = 15 * 1024 * 1024

export interface SciBriefInput {
  slug: string
  titleId: string
  titleEn: string
  summaryId: string
  summaryEn: string
  /** YYYY-MM */
  periodMonth: string
  /** ISO timestamp the brief becomes visible (when published). */
  releaseAt: string
  status: SciBriefStatus
  previewPages: number
}

export type SciBriefField = keyof SciBriefInput

export type SciBriefValidationResult =
  | { ok: true; value: SciBriefInput }
  | { ok: false; errors: Partial<Record<SciBriefField, string>> }

export interface SciBriefPublicDto {
  id: string
  slug: string
  title: { id: string; en: string }
  summary: { id: string; en: string }
  periodMonth: string
  releaseAt: string
  totalPages: number | null
  previewPages: number
  /** Relative URL of the public preview PDF, or null until a document is uploaded. */
  previewUrl: string | null
}

export interface SciBriefAdminDto extends Omit<SciBriefPublicDto, 'previewUrl'> {
  status: SciBriefStatus
  documentName: string | null
  hasDocument: boolean
  createdAt: string
  updatedAt: string
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const slugifySciBrief = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')

export const validateSciBriefInput = (input: unknown): SciBriefValidationResult => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<SciBriefField, string>> = {}

  const titleId = asString(raw.titleId)
  const titleEn = asString(raw.titleEn) || titleId
  if (titleId.length < 2 || titleId.length > 200) errors.titleId = 'Judul wajib diisi (maks 200 karakter).'
  if (titleEn.length > 200) errors.titleEn = 'Maks 200 karakter.'

  const summaryId = asString(raw.summaryId)
  const summaryEn = asString(raw.summaryEn) || summaryId
  if (summaryId.length < 2 || summaryId.length > 600) errors.summaryId = 'Deskripsi singkat wajib diisi (maks 600 karakter).'
  if (summaryEn.length > 600) errors.summaryEn = 'Maks 600 karakter.'

  const periodMonth = asString(raw.periodMonth)
  if (!MONTH_PATTERN.test(periodMonth)) errors.periodMonth = 'Pilih bulan (format YYYY-MM).'

  const releaseText = asString(raw.releaseAt)
  const releaseMs = Date.parse(releaseText)
  if (!releaseText || Number.isNaN(releaseMs)) errors.releaseAt = 'Tanggal rilis tidak valid.'

  const status = asString(raw.status) || 'draft'
  if (!(SCI_BRIEF_STATUSES as readonly string[]).includes(status)) errors.status = 'Status tidak valid.'

  const previewPagesRaw = raw.previewPages === undefined || raw.previewPages === '' ? SCI_BRIEF_DEFAULT_PREVIEW_PAGES : Number(raw.previewPages)
  if (!Number.isInteger(previewPagesRaw) || previewPagesRaw < 1 || previewPagesRaw > SCI_BRIEF_MAX_PREVIEW_PAGES) {
    errors.previewPages = `Halaman pratinjau harus 1–${SCI_BRIEF_MAX_PREVIEW_PAGES}.`
  }

  const slugText = asString(raw.slug) || slugifySciBrief(titleEn || titleId)
  if (!SLUG_PATTERN.test(slugText) || slugText.length > 90) errors.slug = 'Slug tidak valid (huruf kecil, angka, dan tanda hubung).'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      slug: slugText,
      titleId,
      titleEn,
      summaryId,
      summaryEn,
      periodMonth,
      releaseAt: new Date(releaseMs).toISOString(),
      status: status as SciBriefStatus,
      previewPages: previewPagesRaw,
    },
  }
}

/** A brief is public once it is published and its release moment has passed. */
export const isSciBriefPublic = (
  brief: { status: string; releaseAt: string },
  now: Date = new Date(),
): boolean => brief.status === 'published' && Date.parse(brief.releaseAt) <= now.getTime()

export const formatSciBriefMonth = (periodMonth: string, locale: 'id' | 'en' = 'en'): string => {
  if (!MONTH_PATTERN.test(periodMonth)) return periodMonth
  const [year, month] = periodMonth.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export interface SciBriefAccessRequestInput {
  title: string
  periodMonth: string
  locale: 'id' | 'en'
  email: string
  whatsappNumber: string
}

/** Pre-filled "I'd like the full brief" messages for the two request channels. */
export const buildSciBriefAccessRequest = (input: SciBriefAccessRequestInput) => {
  const month = formatSciBriefMonth(input.periodMonth, input.locale)
  const isId = input.locale === 'id'
  const subject = isId
    ? `Permintaan akses Sci-Brief lengkap: ${input.title} (${month})`
    : `Request for the full Sci-Brief: ${input.title} (${month})`
  const body = isId
    ? `Halo tim Attentive,\n\nSaya ingin meminta akses ke Sci-Brief lengkap "${input.title}" (${month}).\n\nNama:\nInstansi / perusahaan:\n\nMohon info langkah selanjutnya. Terima kasih.`
    : `Hello Attentive team,\n\nI would like to request access to the full Sci-Brief "${input.title}" (${month}).\n\nName:\nOrganisation / company:\n\nPlease let me know the next steps. Thank you.`
  return {
    subject,
    body,
    emailUrl: `mailto:${input.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsappUrl: `https://wa.me/${input.whatsappNumber.replace(/\D+/g, '')}?text=${encodeURIComponent(body)}`,
  }
}
