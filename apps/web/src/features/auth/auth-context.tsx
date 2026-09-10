import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserDto } from '@attentiveid/shared'

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!res.ok) {
        setUser(null)
        setAccessToken(null)
        return false
      }

      const data = await res.json()
      if (data.status === 'success' && data.accessToken && data.user) {
        setAccessToken(data.accessToken)
        setUser(data.user)
        return true
      }
      return false
    } catch {
      setUser(null)
      setAccessToken(null)
      return false
    }
  }, [])

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
        setUser(data.user)
        setAccessToken(data.accessToken)
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
    try {
      const baseUrl = getApiBaseUrl()
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null)
      setAccessToken(null)
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
