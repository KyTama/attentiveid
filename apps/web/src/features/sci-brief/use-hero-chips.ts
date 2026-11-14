import { useEffect, useState } from 'react'
import type { SciBriefPublicDto } from '@attentiveid/shared'
import { listSciBriefs } from './service'

export const SCI_BRIEF_HERO_CHIP_COUNT = 3

/** "Nov · More Than Mine" for the hero; the newest briefs, oldest of them first. */
export const buildSciBriefChips = (briefs: SciBriefPublicDto[], isId: boolean): string[] =>
  [...briefs]
    .sort((a, b) => Date.parse(b.releaseAt) - Date.parse(a.releaseAt))
    .slice(0, SCI_BRIEF_HERO_CHIP_COUNT)
    .reverse()
    .map((brief) => {
      const [year, month] = brief.periodMonth.split('-').map(Number)
      const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
        month: 'short',
        timeZone: 'UTC',
      })
      return `${monthLabel} · ${isId ? brief.title.id : brief.title.en}`
    })

/**
 * Chips for the Sci-Brief hero slide from the released briefs in the portal.
 * Returns null until loaded, or when none are released (callers keep the typed chips).
 */
export function useSciBriefHeroChips(enabled: boolean, isId: boolean): string[] | null {
  const [briefs, setBriefs] = useState<SciBriefPublicDto[] | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void listSciBriefs().then((result) => {
      if (!cancelled) setBriefs(result)
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  if (!enabled || !briefs || briefs.length === 0) return null
  return buildSciBriefChips(briefs, isId)
}
