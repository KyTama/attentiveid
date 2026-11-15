import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { captureAttribution } from '@/features/booking/attribution'
import type { BookingLang } from '@/features/booking/booking-i18n'
import { BookingForm, type BookingPrefillParams } from '@/features/booking/components/BookingForm'
import { BrandPanel } from '@/features/booking/components/BrandPanel'

const META_PIXEL_ID = '1100407205876573'

function initMetaPixelSafe() {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') return
  if (window.fbq) {
    window.fbq('track', 'PageView')
    return
  }

  const fbqStub = function (...args: unknown[]) {
    if (fbqStub.callMethod) {
      fbqStub.callMethod(...args)
    } else {
      fbqStub.queue.push(args)
    }
  } as ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void
    push: (...args: unknown[]) => void
    loaded: boolean
    version: string
    queue: unknown[][]
  }

  fbqStub.push = fbqStub
  fbqStub.loaded = true
  fbqStub.version = '2.0'
  fbqStub.queue = []
  window.fbq = fbqStub
  ;(window as unknown as { _fbq?: unknown })._fbq = fbqStub

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  window.fbq('set', 'autoConfig', false, META_PIXEL_ID)
  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
}

export function BookingPage() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const [lang, setLang] = useState<BookingLang>(() =>
    i18n.language?.startsWith('en') ? 'en' : 'id',
  )

  const prefill = useMemo<BookingPrefillParams>(() => {
    const psychologistSlug = searchParams.get('psychologist') || undefined
    const concernId = searchParams.get('concern') || undefined
    const mode = searchParams.get('mode') || undefined
    const location = searchParams.get('location') || undefined
    const clientStatus = searchParams.get('client') || undefined
    return { psychologistSlug, concernId, mode, location, clientStatus }
  }, [searchParams])

  useEffect(() => {
    captureAttribution()
    initMetaPixelSafe()
    document.title =
      lang === 'en'
        ? 'Consultation Booking | Attentive.id'
        : 'Booking Konsultasi | Attentive.id'
  }, [lang])

  const handleLangChange = (nextLang: BookingLang) => {
    setLang(nextLang)
    void i18n.changeLanguage(nextLang)
  }

  return (
    <div className="min-h-screen bg-[#f5efe4] grid grid-cols-1 lg:grid-cols-[minmax(285px,35%)_minmax(0,1fr)]">
      <BrandPanel lang={lang} />
      <BookingForm lang={lang} onLangChange={handleLangChange} prefill={prefill} />
    </div>
  )
}
