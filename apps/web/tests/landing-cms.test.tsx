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

describe('Landing CMS Page Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Landing Content Editor for admin user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith('/api/auth/refresh')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'success',
              accessToken: 'valid.jwt.token',
              user: adminUser,
            }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            content: null,
          }),
        })
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
      expect(screen.getByText('Landing Content Editor')).toBeDefined()
      expect(screen.getByText('Terbitkan ke Publik')).toBeDefined()
      expect(screen.getByText('Preview Draft ↗')).toBeDefined()
    })
  })
})
