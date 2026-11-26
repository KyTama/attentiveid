import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { IDLE_TIMEOUT_DEFAULT_MINUTES, type UserDto } from '@attentiveid/shared'
import { readStoredActivity, writeLastActivity } from './idle-session'

export interface AuthState {
  user: UserDto | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
}

/** The access token lives 15 minutes on the server, so it is renewed well before that while someone is signed in. */
const RENEW_AFTER_MS = 10 * 60_000
const RENEW_CHECK_MS = 30_000

// The refresh cookie works once. Tabs take turns, so two of them never send the same one (which signs the person out).
const inTurn = <T,>(task: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks ? (navigator.locks.request('attentive-refresh', task) as Promise<T>) : task()

const AuthContext = createContext<AuthContextType | undefined>(undefined)

let activeAccessToken: string | null = null

// eslint-disable-next-line react-refresh/only-export-components
export const getActiveAccessToken = () => activeAccessToken

// eslint-disable-next-line react-refresh/only-export-components
export const getActiveAuthHeaders = (): Record<string, string> => {
  if (!activeAccessToken) return {}
  return { Authorization: `Bearer ${activeAccessToken}` }
}

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const renewedAt = useRef(0)
  /** Goes up at every sign-out, so a renewal that was already on its way is thrown away. */
  const signOuts = useRef(0)

  const updateAccessToken = useCallback((token: string | null) => {
    renewedAt.current = Date.now()
    activeAccessToken = token
    setAccessToken(token)
  }, [])

  const requestRefresh = useCallback(
    () =>
      inTurn(() =>
        fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
      ),
    [],
  )

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const before = signOuts.current
    try {
      const res = await requestRefresh()
      if (before !== signOuts.current) return false

      if (!res.ok) {
        setUser(null)
        updateAccessToken(null)
        return false
      }

      const data = await res.json()
      if (data.status === 'success' && data.accessToken && data.user) {
        updateAccessToken(data.accessToken)
        setUser(data.user)
        return true
      }
      return false
    } catch {
      setUser(null)
      updateAccessToken(null)
      return false
    }
  }, [requestRefresh, updateAccessToken])

  // Keeps the sign-in alive while the portal is open. The idle timer (the person's own setting) is what signs them out.
  const signedIn = Boolean(user)
  const idleMinutes = user?.idleTimeoutMinutes ?? IDLE_TIMEOUT_DEFAULT_MINUTES
  useEffect(() => {
    if (!signedIn) return
    let running = false
    const renew = async () => {
      if (running || Date.now() - renewedAt.current < RENEW_AFTER_MS) return
      // Idle for longer than their own setting (also on public pages, where there is no idle timer): let it lapse.
      const active = readStoredActivity()
      if (active > 0 && Date.now() - active >= idleMinutes * 60_000) return
      running = true
      const before = signOuts.current
      try {
        const res = await requestRefresh()
        if (before !== signOuts.current) return
        if (res.status === 401) {
          setUser(null)
          updateAccessToken(null)
        } else if (res.ok) {
          const data = await res.json()
          if (before === signOuts.current && data.status === 'success' && data.accessToken && data.user) {
            updateAccessToken(data.accessToken)
            setUser(data.user)
          }
        }
      } catch {
        // Offline for a moment: stay signed in and try again at the next check.
      } finally {
        running = false
      }
    }
    const timer = window.setInterval(() => void renew(), RENEW_CHECK_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void renew()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [signedIn, idleMinutes, requestRefresh, updateAccessToken])

  useEffect(() => {
    let mounted = true
    async function initAuth() {
      setIsLoading(true)
      await refreshSession()
      if (mounted) {
        setIsLoading(false)
      }
    }
    initAuth()
    return () => {
      mounted = false
    }
  }, [refreshSession])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok && data.status === 'success') {
        // A new sign-in starts the idle clock afresh.
        writeLastActivity(Date.now())
        setUser(data.user)
        updateAccessToken(data.accessToken)
        return { success: true }
      }

      const errorMessage = data.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } catch {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    signOuts.current += 1
    try {
      // In the same queue as renewals, so it always revokes the newest cookie.
      await inTurn(() =>
        fetch(`${getApiBaseUrl()}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        }),
      )
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null)
      updateAccessToken(null)
    }
  }

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!accessToken) return {}
    return { Authorization: `Bearer ${accessToken}` }
  }, [accessToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        error,
        login,
        logout,
        refreshSession,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
