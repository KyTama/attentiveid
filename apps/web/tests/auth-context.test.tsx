import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import type { UserDto } from '@attentiveid/shared'
import { AuthProvider, useAuth } from '../src/features/auth/auth-context'

const mockUser: UserDto = {
  id: 'user-admin-001',
  email: 'admin@attentive.id',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: '2026-09-10T10:00:00Z',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-10T10:00:00Z',
}

describe('AuthProvider & useAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hydrates user session on mount when refresh token is valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        accessToken: 'valid.jwt.token',
        user: mockUser,
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.accessToken).toBe('valid.jwt.token')
    expect(result.current.getAuthHeaders()).toEqual({ Authorization: 'Bearer valid.jwt.token' })
  })

  it('sets user to null when refresh token check fails on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: 'unauthorized' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.getAuthHeaders()).toEqual({})
  })

  it('logs in user successfully and sets access token', async () => {
    // Initial refresh check returns 401
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ status: 'unauthorized' }),
      })
      // Login call returns success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          accessToken: 'login.jwt.token',
          user: mockUser,
        }),
      })

    vi.stubGlobal('fetch', fetchMock)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let loginRes: { success: boolean } | undefined
    await act(async () => {
      loginRes = await result.current.login('admin@attentive.id', 'password123')
    })

    expect(loginRes?.success).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.accessToken).toBe('login.jwt.token')
  })
})
