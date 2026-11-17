import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { catsAllowedOn, giftAllowedOn, renderGiftMessage, type PrayerPublicDto } from '@attentiveid/shared'
import { useCatPreference } from '@/features/cats/cat-preference'
import { startGiftCats } from '@/features/gift/gift-cats'
import {
  CAT_READY_TIMEOUT_MS,
  GIFT_STEP_SIZES,
  GROW_INTERVAL_MS,
  NO_CAT_START_DELAY_MS,
  coversScreen,
  giftDue,
  markGiftShown,
  nextStep,
  type GiftStage,
} from '@/features/gift/gift-timeline'
import { useTx } from '@/features/i18n/use-tx'
import { fetchGiftPrayer } from '@/features/prayer/service'
import { loadSiteSettings, useSiteSettings } from '@/features/site-settings/use-site-settings'
import { GiftBox, GiftCoverArt } from './GiftBox'
import { GiftLetter } from './GiftLetter'
import { GiftQuestion } from './GiftQuestion'
import './gift.css'

const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The gift. It shows when a visitor comes to a page the admin has switched it on for (Pengaturan Situs > Hadiah), once per
 * session by default. With the cat button on, a cat shows it to the visitor and calls "Click me!"; after three unanswered tries
 * a second cat joins and the gift grows step by step until it covers the screen. With the cats off it simply grows.
 * Opening it shows a letter with a random prayer; closing the letter asks whether to send a prayer, and both answers lead to
 * the Let There Be Light page.
 */
export function GiftManager() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { gift, cats } = useSiteSettings()
  const { tx, isEn } = useTx()
  const [catPref] = useCatPreference()

  const [ready, setReady] = useState(false)
  const [storedStage, setStage] = useState<GiftStage>('hidden')
  const [step, setStep] = useState(0)
  const [escalated, setEscalated] = useState(false)
  const [catsFailed, setCatsFailed] = useState(false)
  const [wobble, setWobble] = useState(false)
  const [letter, setLetter] = useState<{ message: string; prayer: string } | null>(null)

  const startedRef = useRef(false)
  const openingRef = useRef(false)
  const spotRef = useRef<HTMLButtonElement>(null)
  const prayerRef = useRef<Promise<PrayerPublicDto> | null>(null)
  const langRef = useRef<'id' | 'en'>(isEn ? 'en' : 'id')
  useEffect(() => {
    langRef.current = isEn ? 'en' : 'id'
  }, [isEn])

  useEffect(() => {
    let active = true
    void loadSiteSettings().then(() => active && setReady(true))
    return () => {
      active = false
    }
  }, [])

  const allowed = ready && giftAllowedOn(gift, pathname)
  // Derived, not stored: left the pages the gift is for (put it away), or grown to cover the screen.
  const stage: GiftStage =
    !allowed && (storedStage === 'waiting' || storedStage === 'cover')
      ? 'done'
      : storedStage === 'waiting' && coversScreen(step)
        ? 'cover'
        : storedStage

  // Start once, when the visitor is on a page where the gift is allowed and it is due.
  useEffect(() => {
    if (!allowed || startedRef.current || !giftDue(gift.frequency)) return
    // after this render, so the gift pops in on its own. The "started" flag is set inside the timer: React may run and undo
    // this effect once before keeping it (development mode), and the second run must still be able to start the gift.
    const timer = window.setTimeout(() => {
      if (startedRef.current) return
      startedRef.current = true
      markGiftShown(gift.frequency)
      prayerRef.current = fetchGiftPrayer(langRef.current)
      setStep(0)
      setStage('waiting')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [allowed, gift.frequency])

  const catMode = catPref && catsAllowedOn(cats, pathname) && !prefersReducedMotion() && !catsFailed

  const openGift = useCallback(async () => {
    if (openingRef.current) return
    openingRef.current = true
    const prayer = await (prayerRef.current ?? fetchGiftPrayer(langRef.current))
    const template = langRef.current === 'en' ? gift.messageEn : gift.messageId
    setLetter({
      message: renderGiftMessage(template, prayer),
      prayer: prayer.text.trim(),
    })
    setStage('open')
  }, [gift.messageEn, gift.messageId])
  const openGiftRef = useRef(openGift)
  useEffect(() => {
    openGiftRef.current = openGift
  }, [openGift])

  // While the small gift waits: the cats call the visitor, or (no cats) a timer starts the growing.
  useEffect(() => {
    if (stage !== 'waiting') return
    if (catMode) {
      const director = startGiftCats({
        api: () => window.AttentiveCats as never,
        giftX: () => {
          const rect = spotRef.current?.getBoundingClientRect()
          return rect ? rect.left + rect.width / 2 : window.innerWidth * 0.7
        },
        onCall: () => {
          setWobble(true)
          window.setTimeout(() => setWobble(false), 1900)
        },
        onEscalate: () => setEscalated(true),
        onCatClicked: () => void openGiftRef.current(),
        onUnavailable: () => setCatsFailed(true),
        bubbleText: () => (langRef.current === 'en' ? 'Click me!' : 'Klik aku!'),
        readyTimeoutMs: CAT_READY_TIMEOUT_MS,
      })
      return () => director.stop()
    }
    const timer = window.setTimeout(() => setEscalated(true), NO_CAT_START_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [stage, catMode])

  // Growing: one step now, then one every few seconds, until it covers the screen.
  useEffect(() => {
    if (stage !== 'waiting' || !escalated) return
    const first = window.setTimeout(() => setStep((current) => nextStep(current)), 0)
    const timer = window.setInterval(() => setStep((current) => nextStep(current)), GROW_INTERVAL_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [stage, escalated])

  // The page behind does not scroll while the gift covers it or a letter is open.
  useEffect(() => {
    if (stage !== 'cover' && stage !== 'open' && stage !== 'question') return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [stage])

  const skip = useCallback(() => setStage('done'), [])
  useEffect(() => {
    if (stage !== 'cover') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, skip])

  if (stage === 'hidden' || stage === 'done') return null

  const openLabel = tx('Buka hadiahmu', 'Open your gift')

  if (stage === 'waiting') {
    const size = Math.min(GIFT_STEP_SIZES[Math.min(step, GIFT_STEP_SIZES.length - 1)], Math.round(window.innerWidth * 0.8))
    return (
      <div className="gift-root">
        <button
          aria-label={openLabel}
          className="gift-spot"
          data-pop="true"
          data-wobble={wobble ? 'true' : 'false'}
          key={step}
          onClick={() => void openGift()}
          ref={spotRef}
          type="button"
        >
          <GiftBox imageUrl={gift.giftImageUrl} size={size} />
        </button>
      </div>
    )
  }

  if (stage === 'cover') {
    return (
      <div className="gift-root">
        <button aria-label={openLabel} className="gift-cover" data-custom={gift.giftImageUrl ? 'true' : 'false'} onClick={() => void openGift()} type="button">
          <GiftCoverArt imageUrl={gift.giftImageUrl} />
          <span className="gift-cover-label">{tx('Ketuk untuk membuka hadiahmu', 'Tap to open your gift')}</span>
        </button>
        <button className="gift-skip" onClick={skip} type="button">
          {tx('Lewati', 'Skip')}
        </button>
      </div>
    )
  }

  if (stage === 'open' && letter) {
    return (
      <GiftLetter
        message={letter.message}
        onClose={() => setStage('question')}
        prayerText={letter.prayer}
        sealBack={gift.sealBackUrl}
        sealFront={gift.sealFrontUrl}
      />
    )
  }

  if (stage === 'question') {
    return (
      <GiftQuestion
        onPass={() => {
          setStage('done')
          navigate('/')
        }}
        onYes={() => {
          setStage('done')
          navigate('/let-there-be-light?prayer=1')
        }}
      />
    )
  }

  return null
}
