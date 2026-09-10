import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'

const adminUser: UserDto = {
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

const psychologistUser: UserDto = {
  id: 'user-psych-001',
  email: 'psychologist@attentive.id',
  name: 'Dr. Syazka',
  role: 'psychologist',
  status: 'active',
  psychologistId: 'syazka',
  lastLoginAt: '2026-09-10T11:00:00Z',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-10T11:00:00Z',
}

describe('Dashboard Protected Routes & Layout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated user accessing /dashboard to /portal-gate', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ status: 'unauthorized' }),
      })
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Attentive.id Portal')).toBeDefined()
      expect(screen.getByLabelText('Email Address')).toBeDefined()
    })
  })

  it('renders 404 Not Found when accessing decommissioned /login route', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Page not found/i)).toBeDefined()
    })
  })

  it('renders dashboard overview when admin is authenticated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          accessToken: 'valid.token',
          user: adminUser,
        }),
      })
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Selamat Datang, Admin User!')).toBeDefined()
      expect(screen.getByText('Landing Content CMS')).toBeDefined()
      expect(screen.getAllByText('Direktori Psikolog').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders 403 Forbidden screen when a psychologist accesses admin-only /dashboard/landing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          accessToken: 'valid.token',
          user: psychologistUser,
        }),
      })
    )

    render(
      <MemoryRouter initialEntries={['/dashboard/landing']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/403 -/i)).toBeDefined()
    })
  })
})
