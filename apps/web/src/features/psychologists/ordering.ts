/**
 * Directory order: the Featured order set in the portal leads (Featured 1, 2, 3...).
 * Psychologists without a Featured number follow, and among those, anyone whose
 * bio is filled in comes before those with a thin profile. Inside each group the
 * incoming order is kept.
 */
const MIN_FULL_BIOGRAPHY_LENGTH = 300

interface OrderFields {
  featuredOrder?: number | null
  shortBio?: string
  biography?: string
}

/** A bio counts as filled in when there is a short bio and a real (not one-line) full biography. */
export const hasCompleteBio = (record: Pick<OrderFields, 'shortBio' | 'biography'>) =>
  Boolean(record.shortBio?.trim()) && (record.biography?.trim().length ?? 0) >= MIN_FULL_BIOGRAPHY_LENGTH

export function orderForDirectory<T extends OrderFields>(records: readonly T[]): T[] {
  const group = (record: T) => {
    if (record.featuredOrder !== null && record.featuredOrder !== undefined) return 0
    return hasCompleteBio(record) ? 1 : 2
  }
  return records
    .map((record, index) => ({ record, index, group: group(record) }))
    .sort((a, b) => {
      if (a.group !== b.group) return a.group - b.group
      if (a.group === 0) {
        return (a.record.featuredOrder as number) - (b.record.featuredOrder as number) || a.index - b.index
      }
      return a.index - b.index
    })
    .map(({ record }) => record)
}
