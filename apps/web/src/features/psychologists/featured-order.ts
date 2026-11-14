/**
 * Moves `id` to a 1-based `position` in the list. Everyone it passes shifts by
 * one place, so the numbers shown to the editor are always 1..n with no gaps
 * or duplicates. Out-of-range positions are clamped.
 */
export function moveToPosition<T>(items: readonly T[], id: T, position: number): T[] {
  const from = items.indexOf(id)
  if (from === -1) return [...items]
  const to = Math.min(Math.max(Math.trunc(position) || 1, 1), items.length) - 1
  const next = items.filter((item) => item !== id)
  next.splice(to, 0, id)
  return next
}

export const isSameOrder = <T>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((item, index) => item === b[index])
