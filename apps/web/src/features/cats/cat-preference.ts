import { useCallback, useSyncExternalStore } from 'react'

/** The visitor's own choice for the walking cats. Off until they turn it on; remembered in this browser. */
const KEY = 'attentive-cats'
const EVENT = 'attentive-cats-preference'

export const getCatPreference = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

export const setCatPreference = (on: boolean) => {
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // storage blocked: the choice still applies until the page is closed
    memory = on
  }
  window.dispatchEvent(new Event(EVENT))
}

let memory: boolean | null = null

const read = () => (memory !== null ? memory : getCatPreference())

const subscribe = (listener: () => void) => {
  window.addEventListener(EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useCatPreference(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, read, () => false)
  const set = useCallback((value: boolean) => setCatPreference(value), [])
  return [on, set]
}
