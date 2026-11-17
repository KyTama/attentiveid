import { useEffect, useRef } from 'react'
import { useTx } from '@/features/i18n/use-tx'

interface GiftQuestionProps {
  /** "Yes": go to the prayer page and open the form. */
  onYes: () => void
  /** "Not now": go to the prayer page without the form. */
  onPass: () => void
}

/** Asked after the letter is closed. Both answers lead to the Let There Be Light page. */
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
            {tx('Ya, antar aku ke sana!', 'Yes, take me there!')}
          </button>
          <button className="gift-button" data-tone="quiet" onClick={onPass} type="button">
            {tx('Lain kali dulu, aku agak lelah', "I'll pass for now, I'm a bit tired")}
          </button>
        </div>
      </div>
    </div>
  )
}
