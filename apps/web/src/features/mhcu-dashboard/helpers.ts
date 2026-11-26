import { MHCU_LEVELS } from '@attentiveid/shared'
import { REPORT_READY_PAYMENT, type MhcuDetail, type MhcuListItem, type MhcuSettings, type Overview } from './api'

export const LEVEL_STYLE: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-amber-100 text-amber-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-rose-100 text-rose-800',
}

export const PAYMENT_STYLE: Record<string, string> = {
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FREE: 'bg-sky-50 text-sky-700 border-sky-200',
  INCLUDED: 'bg-sky-50 text-sky-700 border-sky-200',
  LEGACY: 'bg-slate-100 text-slate-600 border-slate-200',
}

export type StatusFilter = 'all' | 'new' | 'reviewed' | 'released'
export type TodoFilter = '' | 'proof' | 'unreleased' | 'unassigned' | 'return' | 'urgent'

export interface MhcuFilters {
  q: string
  status: StatusFilter
  level: '' | '1' | '2' | '3' | '4' | '5'
  payment: '' | 'UNPAID' | 'PAID' | 'FREE' | 'INCLUDED' | 'LEGACY'
  /** '' = everyone, 'none' = not assigned yet, otherwise a psychologist id. */
  psychologist: string
  todo: TodoFilter
}

export const NO_FILTERS: MhcuFilters = { q: '', status: 'all', level: '', payment: '', psychologist: '', todo: '' }

/** A proof of transfer was sent but nobody has confirmed the payment yet: an admin has to check it. */
export const awaitsConfirmation = (item: Pick<MhcuListItem, 'paymentSubmittedAt' | 'paymentStatus'>): boolean =>
  Boolean(item.paymentSubmittedAt) && item.paymentStatus === 'UNPAID'

/** Search by name, report code, e-mail or phone; every other filter must match too. */
export function filterItems(items: readonly MhcuListItem[], f: MhcuFilters): MhcuListItem[] {
  const term = f.q.trim().toLowerCase()
  return items.filter((item) => {
    if (term && !`${item.name} ${item.code} ${item.email} ${item.phone}`.toLowerCase().includes(term)) return false
    if (f.status !== 'all' && item.status !== f.status) return false
    if (f.level && String(item.level) !== f.level) return false
    if (f.payment && item.paymentStatus !== f.payment) return false
    if (f.psychologist === 'none' ? item.psychologistId !== null : f.psychologist && item.psychologistId !== f.psychologist) return false
    if (f.todo === 'proof' && !awaitsConfirmation(item)) return false
    if (f.todo === 'unreleased' && item.status === 'released') return false
    if (f.todo === 'unassigned' && item.psychologistId !== null) return false
    if (f.todo === 'return' && (item.waveNo ?? 1) < 2) return false
    if (f.todo === 'urgent' && (item.level ?? 0) < 4) return false
    return true
  })
}

export interface CohortSummary {
  results: number
  people: number
  returning: number
  /** Proof of transfer received, payment not confirmed yet. */
  awaiting: number
  unpaid: number
  unassigned: number
  unreleased: number
  /** Count per level, index 0 = level 1. */
  levels: [number, number, number, number, number]
}

/** The cohort tiles, counted from the list (the list is all the staff API gives for now). */
export function summarize(items: readonly MhcuListItem[]): CohortSummary {
  const levels: CohortSummary['levels'] = [0, 0, 0, 0, 0]
  for (const item of items) if (item.level && item.level >= 1 && item.level <= 5) levels[item.level - 1] += 1
  return {
    results: items.length,
    people: new Set(items.map((item) => item.email.trim().toLowerCase())).size,
    returning: items.filter((item) => (item.waveNo ?? 1) >= 2).length,
    awaiting: items.filter(awaitsConfirmation).length,
    unpaid: items.filter((item) => item.paymentStatus === 'UNPAID').length,
    unassigned: items.filter((item) => item.psychologistId === null).length,
    unreleased: items.filter((item) => item.status !== 'released').length,
    levels,
  }
}

/** The standard recommendation of a level, in the report language of the person. */
export function defaultRecommendation(level: number | null, lang: string): string {
  const def = MHCU_LEVELS[(level && level >= 1 && level <= 5 ? level : 3) as 1 | 2 | 3 | 4 | 5]
  return lang === 'en' ? def.actionEn : def.actionId
}

export const CUSTOM_NOTE_MAX = 500

export interface NoteDraft {
  /** Indonesian report */
  template: string
  custom: string
  /** English report: written by the psychologist, never machine-translated */
  templateEn: string
  customEn: string
  final: boolean
}

type NoteSource = Pick<MhcuDetail, 'noteTemplate' | 'noteCustom' | 'noteTemplateEn' | 'noteCustomEn' | 'noteFinal' | 'level'>

export function noteDraftOf(detail: NoteSource): NoteDraft {
  return {
    template: detail.noteTemplate?.trim() || defaultRecommendation(detail.level, 'id'),
    custom: detail.noteCustom ?? '',
    templateEn: detail.noteTemplateEn?.trim() || defaultRecommendation(detail.level, 'en'),
    customEn: detail.noteCustomEn ?? '',
    final: detail.noteFinal,
  }
}

/** What goes to the server: the standard text is saved as "no edit" (null), so a later change of the standard still applies. */
export function noteInputOf(draft: NoteDraft, detail: Pick<MhcuDetail, 'level'>) {
  const edited = (value: string, lang: 'id' | 'en') => {
    const text = value.trim()
    return text && text !== defaultRecommendation(detail.level, lang).trim() ? text : null
  }
  return {
    template: edited(draft.template, 'id'),
    custom: draft.custom.trim() || null,
    templateEn: edited(draft.templateEn, 'en'),
    customEn: draft.customEn.trim() || null,
    final: draft.final,
  }
}

/** True when the psychologist wrote their own text in Indonesian but not in English: the English report then says so instead of printing it. */
export function englishNoteMissing(draft: NoteDraft, detail: Pick<MhcuDetail, 'level'>): boolean {
  const input = noteInputOf(draft, detail)
  return Boolean((input.template && !input.templateEn) || (input.custom && !input.customEn))
}

/** The mirror case: own text in English but none in Indonesian; the Indonesian report then says so instead of printing it. */
export function indonesianNoteMissing(draft: NoteDraft, detail: Pick<MhcuDetail, 'level'>): boolean {
  const input = noteInputOf(draft, detail)
  return Boolean((input.templateEn && !input.template) || (input.customEn && !input.custom))
}

export const noteChanged = (draft: NoteDraft, detail: NoteSource): boolean => {
  const saved = noteDraftOf(detail)
  return (
    draft.template.trim() !== saved.template.trim() ||
    draft.custom.trim() !== saved.custom.trim() ||
    draft.templateEn.trim() !== saved.templateEn.trim() ||
    draft.customEn.trim() !== saved.customEn.trim() ||
    draft.final !== saved.final
  )
}

/** Whole rupiah from what was typed ("227.000", "Rp 227000"); '' = none; null = not a number. */
export function parseAmount(text: string): number | '' | null {
  const body = text.trim().replace(/^rp\.?\s*/i, '')
  if (!body) return ''
  if (!/^(\d{1,3}([.,]\d{3})+|\d+)$/.test(body)) return null
  const value = Number(body.replace(/\D/g, ''))
  return Number.isSafeInteger(value) && value <= 100_000_000 ? value : null
}

/** Why the report cannot be released yet, if it cannot (the server refuses with 409 for the same reasons). */
export function releaseBlocker(detail: Pick<MhcuDetail, 'noteFinal' | 'paymentStatus' | 'status'>): 'released' | 'note' | 'payment' | null {
  if (detail.status === 'released') return 'released'
  if (!detail.noteFinal) return 'note'
  if (!REPORT_READY_PAYMENT.includes(detail.paymentStatus)) return 'payment'
  return null
}

export const fmt1 = (value: unknown): string =>
  typeof value === 'number' && Number.isFinite(value) ? (Math.round(value * 10) / 10).toFixed(1).replace('.', ',') : '–'

export const dateText = (iso: string): string =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })

/* ---------------------------------- charts and summary ---------------------------------- */

/** Level colours of the charts (the same as the e-mail and the demo dashboard). */
export const LEVEL_HEX: Record<number, string> = { 1: '#2E8B57', 2: '#9BBF3B', 3: '#F2B33D', 4: '#E8742C', 5: '#C62828' }

/** The four reference bands of the MHI (from, to, name index of MHCU level 4..1). */
export const MHI_BANDS = [
  { from: 0, to: 40, fill: '#E8742C', level: 4 },
  { from: 40, to: 55, fill: '#F2B33D', level: 3 },
  { from: 55, to: 70, fill: '#9BBF3B', level: 2 },
  { from: 70, to: 100, fill: '#2E8B57', level: 1 },
] as const

export const levelNameOf = (level: number | null, lang: 'id' | 'en'): string => {
  if (!level || level < 1 || level > 5) return ''
  const def = MHCU_LEVELS[level as 1 | 2 | 3 | 4 | 5]
  return lang === 'en' ? def.en : def.id
}

/** Position of the MHI marker on a 0-100 bar, in percent (clamped). */
export const markerPercent = (mhi: number | null): number | null => (mhi === null || !Number.isFinite(mhi) ? null : Math.max(0, Math.min(100, mhi)))

export interface ChartPoint {
  id: string
  x: number
  y: number
  mhi: number
  level: number
  label: string
  caption: string
  current: boolean
}

export const CHART = { W: 480, H: 170, left: 42, right: 34, top: 16, bottom: 34 } as const

/** Coordinates of the dots of the MHI history chart. Waves without an MHI are left out of the line. */
export function chartPoints(waves: readonly { id: string; waveNo: number; date: string; mhi: number | null; level: number }[], currentId: string): ChartPoint[] {
  const usable = waves.filter((w): w is typeof w & { mhi: number } => w.mhi !== null && Number.isFinite(w.mhi))
  const width = CHART.W - CHART.left - CHART.right
  const height = CHART.H - CHART.top - CHART.bottom
  return usable.map((w, i) => ({
    id: w.id,
    x: CHART.left + (usable.length === 1 ? width / 2 : (i * width) / (usable.length - 1)),
    y: CHART.top + ((100 - Math.max(0, Math.min(100, w.mhi))) / 100) * height,
    mhi: w.mhi,
    level: w.level,
    label: fmt1(w.mhi),
    caption: `T${w.waveNo} ${w.date.slice(5, 10)}`,
    current: w.id === currentId,
  }))
}

export const yOfScore = (score: number): number => CHART.top + ((100 - score) / 100) * (CHART.H - CHART.top - CHART.bottom)

/** "+4,7" / "-1,9" / "0,0"; '–' when unknown. */
export const signed1 = (value: number | null): string => {
  if (value === null || !Number.isFinite(value)) return '–'
  const r = Math.round(value * 10) / 10
  return `${r > 0 ? '+' : ''}${r.toFixed(1).replace('.', ',')}`
}

export const deltaTone = (value: number | null): string =>
  value === null || Math.round(value * 10) === 0 ? 'text-slate-500' : value > 0 ? 'text-emerald-700' : 'text-rose-700'

export const TRACKS: Record<string, [string, string]> = {
  mandiri: ['Pemeriksaan mandiri', 'Self check-up'],
  asesmen: ['Asesmen awal', 'Initial assessment'],
  free: ['Free session', 'Free session'],
  paket: ['Paket', 'Package'],
  lanjutan: ['Lanjutan', 'Follow-up'],
  legacy: ['Data lama', 'Legacy data'],
}

export const trackLabel = (track: string | undefined, lang: 'id' | 'en'): string | null => {
  if (!track) return null
  const names = TRACKS[track]
  return names ? names[lang === 'en' ? 1 : 0] : track
}

/** "2026-11" -> "Nov 26" / "Nov 26" (Indonesian month short names). */
export function monthLabel(month: string, lang: 'id' | 'en'): string {
  const m = /^(\d{4})-(\d{2})$/.exec(month)
  if (!m) return month
  const id = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${(lang === 'en' ? en : id)[Number(m[2]) - 1] ?? m[2]} ${m[1]!.slice(2)}`
}

/** Fallback for the overview when the call fails: the counts that can be made from the list alone. */
export function overviewFromList(items: readonly MhcuListItem[]): Pick<Overview, 'sessions' | 'participants' | 'returning' | 'levels' | 'unpaid' | 'awaitingConfirmation' | 'notAssigned'> {
  const s = summarize(items)
  return { sessions: s.results, participants: s.people, returning: s.returning, levels: s.levels, unpaid: s.unpaid, awaitingConfirmation: s.awaiting, notAssigned: s.unassigned }
}

/* ------------------------------------ settings ------------------------------------ */

/** "1.250.000" (thousand points); '' for none. */
export const formatThousands = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '' : String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** Digits typed into a rupiah field, re-shown with thousand points while typing. */
export const regroupRupiah = (typed: string): string => formatThousands(typed.replace(/\D/g, '') === '' ? null : Number(typed.replace(/\D/g, '')))

/** The rupiah text as a whole number; null when empty or not a number. */
export const rupiahValue = (text: string): number | null => {
  const digits = text.replace(/\./g, '').trim()
  return /^\d{1,9}$/.test(digits) ? Number(digits) : null
}

export const settingsEqual = (a: MhcuSettings, b: MhcuSettings): boolean => JSON.stringify(a) === JSON.stringify(b)

/** Easy mistakes caught before sending; the server still has the last word and its messages are shown as given. */
export function settingsProblem(s: MhcuSettings, lang: 'id' | 'en'): string | null {
  const t = (id: string, en: string) => (lang === 'en' ? en : id)
  for (const [label, p] of [['1x', s.pricing.single], ['3x', s.pricing.package3]] as const) {
    if (!Number.isInteger(p.normal) || p.normal < 0 || !Number.isInteger(p.promo) || p.promo < 0) return t(`Harga ${label} harus angka rupiah.`, `The ${label} prices must be rupiah amounts.`)
    if (p.promo > p.normal) return t(`Harga promo ${label} tidak boleh lebih tinggi dari harga normal.`, `The ${label} promo price cannot be higher than the normal price.`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.pricing.promoUntil)) return t('Isi tanggal akhir promo.', 'Enter the last day of the promo.')
  if (s.alertEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.alertEmail.trim())) return t('Alamat email peringatan tidak valid.', 'The alert e-mail address is not valid.')
  return null
}
