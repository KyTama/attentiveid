import { useEffect, useState } from 'react'

let globalDismissed = false
const listeners = new Set<(dismissed: boolean) => void>()

export function useCampaignDock() {
  const [isDismissed, setIsDismissedState] = useState(globalDismissed)

  useEffect(() => {
    const listener = (val: boolean) => setIsDismissedState(val)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const setDismissed = (val: boolean) => {
    globalDismissed = val
    listeners.forEach((listener) => listener(val))
  }

  return {
    isDismissed,
    dismissDock: () => setDismissed(true),
    restoreDock: () => setDismissed(false),
  }
}
