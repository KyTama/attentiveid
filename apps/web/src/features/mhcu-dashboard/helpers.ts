import { MHCU_LEVELS } from '@attentiveid/shared'
import { REPORT_READY_PAYMENT, type MhcuDetail, type MhcuListItem } from './api'

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
export type TodoFilter = '' | 'unreleased' | 'unassigned' | 'return' | 'urgent'

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

/** Search by name, report code, e-mail or phone; every other filter must match too. */
export function filterItems(items: readonly MhcuListItem[], f: MhcuFilters): MhcuListItem[] {
  const term = f.q.trim().toLowerCase()
  return items.filter((item) => {
    if (term && !`${item.name} ${item.code} ${item.email} ${item.phone}`.toLowerCase().includes(term)) return false
    if (f.status !== 'all' && item.status !== f.status) return false
    if (f.level && String(item.level) !== f.level) return false
    if (f.payment && item.paymentStatus !== f.payment) return false
    if (f.psychologist === 'none' ? item.psychologistId !== null : f.psychologist && item.psychologistId !== f.psychologist) return false
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
  template: string
  custom: string
  final: boolean
}

export function noteDraftOf(detail: Pick<MhcuDetail, 'noteTemplate' | 'noteCustom' | 'noteFinal' | 'level' | 'lang'>): NoteDraft {
  return {
    template: detail.noteTemplate?.trim() || defaultRecommendation(detail.level, detail.lang),
    custom: detail.noteCustom ?? '',
    final: detail.noteFinal,
  }
}

/** What goes to the server: the standard text is saved as "no edit" (null), so a later change of the standard still applies. */
export function noteInputOf(draft: NoteDraft, detail: Pick<MhcuDetail, 'level' | 'lang'>) {
  const template = draft.template.trim()
  const unchanged = template === defaultRecommendation(detail.level, detail.lang).trim()
  return { template: template && !unchanged ? template : null, custom: draft.custom.trim() || null, final: draft.final }
}

export const noteChanged = (draft: NoteDraft, detail: Pick<MhcuDetail, 'noteTemplate' | 'noteCustom' | 'noteFinal' | 'level' | 'lang'>): boolean => {
  const saved = noteDraftOf(detail)
  return draft.template.trim() !== saved.template.trim() || draft.custom.trim() !== saved.custom.trim() || draft.final !== saved.final
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
