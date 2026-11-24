import { useEffect, useSyncExternalStore } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'

const KEY = 'attentive-admin-theme'
const listeners = new Set<() => void>()

const read = (): ThemeChoice => {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'light'
  } catch {
    return 'light'
  }
}

let choice: ThemeChoice = read()

const systemPrefersDark = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches

export const resolveTheme = (value: ThemeChoice, prefersDark: boolean): 'light' | 'dark' =>
  value === 'system' ? (prefersDark ? 'dark' : 'light') : value

export const setThemeChoice = (value: ThemeChoice) => {
  choice = value
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* private window or blocked storage: the choice just lasts until the page closes */
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The saved choice (light, dark or follow the device), and a setter. */
export function useThemeChoice(): [ThemeChoice, (value: ThemeChoice) => void] {
  const value = useSyncExternalStore(subscribe, () => choice, () => 'light' as ThemeChoice)
  return [value, setThemeChoice]
}

/**
 * Puts the dark class on <html> while the portal is open, and takes it off when the portal closes,
 * so the public website is never affected. Returns whether the portal is dark right now.
 */
export function useApplyAdminTheme(): boolean {
  const [value] = useThemeChoice()
  const dark = useSyncExternalStore(
    (listener) => {
      const query = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null
      query?.addEventListener('change', listener)
      return () => query?.removeEventListener('change', listener)
    },
    () => systemPrefersDark(),
    () => false,
  )
  const isDark = resolveTheme(value, dark) === 'dark'
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('admin-dark', isDark)
    root.classList.toggle('dark', isDark)
    return () => {
      root.classList.remove('admin-dark', 'dark')
    }
  }, [isDark])
  return isDark
}
