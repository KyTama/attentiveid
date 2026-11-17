import { useEffect, useRef } from 'react'
import { useTx } from '@/features/i18n/use-tx'

export const DEFAULT_SEAL_FRONT = '/images/brand/attend-mark.png'
export const DEFAULT_SEAL_BACK = '/images/brand/star-glow.svg'

interface GiftLetterProps {
  /** The finished letter text (template with the prayer put in). */
  message: string
  /** The prayer text, so it can be set in italics inside the letter. */
  prayerText: string
  sealFront?: string
  sealBack?: string
  onClose: () => void
}

/** The cream letter that comes out of the gift. The seal turns between the Attentive mark and the lights logo. */
export function GiftLetter({ message, prayerText, sealFront, sealBack, onClose }: GiftLetterProps) {
  const { tx } = useTx()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Put the prayer in italics without letting the text be read as markup.
  const at = prayerText ? message.indexOf(prayerText) : -1
  const before = at >= 0 ? message.slice(0, at) : message
  const prayer = at >= 0 ? prayerText : ''
  const after = at >= 0 ? message.slice(at + prayerText.length) : ''

  return (
    <div aria-label={tx('Surat dari hadiahmu', 'The letter from your gift')} aria-modal="true" className="gift-overlay gift-root" role="dialog">
      <div className="gift-letter">
        <p className="gift-letter-text">
          {before}
          {prayer ? <span className="gift-letter-prayer">{prayer}</span> : null}
          {after}
        </p>
        <div aria-hidden="true" className="gift-seal-wrap">
          <div className="gift-seal">
            <span className="gift-seal-face">
              <img alt="" draggable={false} src={sealFront || DEFAULT_SEAL_FRONT} />
            </span>
            <span className="gift-seal-face gift-seal-back">
              <img alt="" draggable={false} src={sealBack || DEFAULT_SEAL_BACK} />
            </span>
          </div>
        </div>
      </div>
      <div className="gift-actions" style={{ position: 'relative', marginTop: 52 }}>
        <button className="gift-button" data-tone="gold" onClick={onClose} ref={closeRef} type="button">
          {tx('Tutup surat', 'Close the letter')}
        </button>
      </div>
    </div>
  )
}
