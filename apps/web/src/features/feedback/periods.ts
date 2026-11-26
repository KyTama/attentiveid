import type { FeedbackReport } from '@attentiveid/shared'

export interface FeedbackPeriod {
  /** First day of the period, YYYY-MM-DD in Jakarta time. */
  start: string
  bug: number
  suggestion: number
}

const DAY = 86_400_000
const jakartaDay = (at: Date) => Math.floor((at.getTime() + 7 * 3600_000) / DAY)

/** The last 14 days; once reports go back further, the last 12 weeks instead. */
export const feedbackPeriods = (reports: Array<Pick<FeedbackReport, 'kind' | 'createdAt'>>, now: Date): { periods: FeedbackPeriod[]; weekly: boolean } => {
  const today = jakartaDay(now)
  const days = reports.map((report) => jakartaDay(new Date(report.createdAt)))
  const weekly = days.some((day) => day <= today - 14)
  const size = weekly ? 7 : 1
  const count = weekly ? 12 : 14
  const first = today - size * count + 1
  const periods = Array.from({ length: count }, (_, i) => ({ start: new Date((first + i * size) * DAY).toISOString().slice(0, 10), bug: 0, suggestion: 0 }))
  reports.forEach((report, i) => {
    const index = Math.floor((days[i] - first) / size)
    if (index >= 0 && index < count) periods[index][report.kind] += 1
  })
  return { periods, weekly }
}
