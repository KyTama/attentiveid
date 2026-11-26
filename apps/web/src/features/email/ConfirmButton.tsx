import { useEffect, useState } from 'react'
import { buttonPrimary } from './styles'

export const CONFIRM_DELAY_SECONDS = 5

/** Stays grey for a few seconds so the numbers get read first. Give it a new key to start the count again. */
export function ConfirmButton({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  const [left, setLeft] = useState(CONFIRM_DELAY_SECONDS)
  useEffect(() => {
    if (left === 0) return
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])
  return (
    <button className={buttonPrimary} disabled={disabled || left > 0} onClick={onClick} type="button">
      {left > 0 ? `${label} (${left})` : label}
    </button>
  )
}
