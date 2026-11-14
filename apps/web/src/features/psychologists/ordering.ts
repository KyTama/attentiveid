/**
 * Directory order: Ella, Syazka and Haykal always come first (in that order),
 * then everyone whose bio is filled in, then the rest. Inside each group the
 * incoming order (Featured number, then name) is kept.
 */
export const PINNED_PSYCHOLOGIST_SLUGS = ['gisella', 'syazka', 'haykal'] as const

const MIN_FULL_BIOGRAPHY_LENGTH = 300

interface BioFields {
  slug: string
  shortBio?: string
  biography?: string
}

/** A bio counts as filled in when there is a short bio and a real (not one-line) full biography. */
export const hasCompleteBio = (record: Pick<BioFields, 'shortBio' | 'biography'>) =>
  Boolean(record.shortBio?.trim()) && (record.biography?.trim().length ?? 0) >= MIN_FULL_BIOGRAPHY_LENGTH

export function orderForDirectory<T extends BioFields>(records: readonly T[]): T[] {
  const rank = (record: T) => {
    const pinned = (PINNED_PSYCHOLOGIST_SLUGS as readonly string[]).indexOf(record.slug)
    if (pinned !== -1) return pinned
    return hasCompleteBio(record) ? PINNED_PSYCHOLOGIST_SLUGS.length : PINNED_PSYCHOLOGIST_SLUGS.length + 1
  }
  return records
    .map((record, index) => ({ record, index, rank: rank(record) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ record }) => record)
}
