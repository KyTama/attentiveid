import { useEffect, useState } from 'react'
import { getPsychologistBySlug } from './service'
import type { PsychologistProfile } from './types'

/**
 * The portal record behind a hero slide (the Ella slide), or null until it
 * loads / if it is missing. Callers keep their typed text as the fallback.
 */
export function useHeroPsychologist(slug: string | null, locale: 'id' | 'en'): PsychologistProfile | null {
  const [profile, setProfile] = useState<PsychologistProfile | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    void getPsychologistBySlug(slug, locale).then((result) => {
      if (!cancelled) setProfile(result.status === 'found' ? result.psychologist : null)
    })
    return () => {
      cancelled = true
    }
  }, [slug, locale])

  return slug ? profile : null
}
