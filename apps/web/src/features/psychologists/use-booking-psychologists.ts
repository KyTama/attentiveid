import { useEffect, useState } from 'react'
import { psychologists as staticPsychologists, type Psychologist } from '@/data/psychologists'
import { listPsychologists } from './service'
import type { PsychologistLocale, PsychologistSummary } from './types'

/**
 * Turns a portal (API) psychologist into the shape the booking pop-up uses.
 * The hand-typed record with the same slug only fills what the portal does not
 * hold (premium link); everything else comes from the portal.
 */
export const toBookingPsychologist = (summary: PsychologistSummary, fallback?: Psychologist): Psychologist => ({
  id: summary.slug,
  name: summary.name,
  nickname: summary.nickname,
  title: summary.credential,
  category: summary.supportArea,
  image: summary.imageUrl ?? summary.media?.url ?? fallback?.image ?? '',
  specializations: summary.specializations,
  experience: summary.experienceLabel,
  sipp: summary.licenseNumber ?? fallback?.sipp ?? '',
  reservationLink: summary.bookingUrl || fallback?.reservationLink || '',
  premiumLink: fallback?.premiumLink ?? summary.bookingUrl,
  shortBio: summary.shortBio ?? fallback?.shortBio,
})

/**
 * Psychologists offered in the booking pop-up: the active list from the portal,
 * so activating, hiding or editing someone there updates the pop-up. The typed
 * list is only a fallback while loading or if the portal cannot be reached.
 */
export function useBookingPsychologists(locale: PsychologistLocale, enabled = true): Psychologist[] {
  const [fromPortal, setFromPortal] = useState<Psychologist[] | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void listPsychologists({ locale }).then((result) => {
      if (cancelled || result.status === 'error') return
      setFromPortal(
        result.psychologists.map((summary) =>
          toBookingPsychologist(summary, staticPsychologists.find((p) => p.id === summary.slug)),
        ),
      )
    })
    return () => {
      cancelled = true
    }
  }, [locale, enabled])

  return fromPortal && fromPortal.length > 0 ? fromPortal : staticPsychologists
}
