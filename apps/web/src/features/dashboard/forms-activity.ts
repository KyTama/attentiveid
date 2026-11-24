import type { AssessmentListItem } from '../assessments/service'

export type FormKey = 'mhcu' | 'gsc'

export interface FormActivity {
  key: FormKey
  id: string
  code: string
  name: string
  level: number | null
  createdAt: string
}

export interface FormSummary {
  key: FormKey
  total: number
  last7Days: number
  newest: string | null
}

const DAY = 24 * 60 * 60 * 1000

/** Counts for one form: how many in total, how many in the last 7 days, and when the newest one came. */
export const summarizeForm = (key: FormKey, items: readonly AssessmentListItem[], now: number = Date.now()): FormSummary => {
  let newest: number | null = null
  let last7Days = 0
  for (const item of items) {
    const at = Date.parse(item.createdAt)
    if (Number.isNaN(at)) continue
    if (newest === null || at > newest) newest = at
    if (now - at <= 7 * DAY) last7Days += 1
  }
  return { key, total: items.length, last7Days, newest: newest === null ? null : new Date(newest).toISOString() }
}

/** The latest activity of all forms in one list, newest first. */
export const mergeActivity = (lists: Partial<Record<FormKey, readonly AssessmentListItem[]>>, limit = 12): FormActivity[] =>
  (Object.entries(lists) as Array<[FormKey, readonly AssessmentListItem[]]>)
    .flatMap(([key, items]) =>
      items.map((item) => ({ key, id: item.id, code: item.code, name: item.name, level: item.level, createdAt: item.createdAt })),
    )
    .filter((entry) => !Number.isNaN(Date.parse(entry.createdAt)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit)
