import { useEffect, useRef } from 'react'
import { useTx } from '@/features/i18n/use-tx'

interface GiftQuestionProps {
  /** "Yes": go to the prayer page and open the form. */
  onYes: () => void
  /** "I'll pass for now": back to the home page. */
  onPass: () => void
}

/** Asked after the letter is closed. "Yes" goes to the Let There Be Light page (with the prayer form open); passing goes back to the home page. */
export function GiftQuestion({ onYes, onPass }: GiftQuestionProps) {
  const { tx } = useTx()
  const yesRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    yesRef.current?.focus()
  }, [])
  return (
    <div aria-labelledby="gift-question-title" aria-modal="true" className="gift-overlay gift-root" role="dialog">
      <div className="gift-question">
        <h2 id="gift-question-title">{tx('Mau mengirim doamu untuk orang lain?', 'Do you want to send your prayer to other?')}</h2>
        <div className="gift-actions">
          <button className="gift-button" data-tone="gold" onClick={onYes} ref={yesRef} type="button">
            {tx('Ya', 'Yes')}
          </button>
          <button className="gift-button" data-tone="quiet" onClick={onPass} type="button">
            {tx('Lain kali dulu', "I'll pass for now")}
          </button>
        </div>
      </div>
    </div>
  )
}
