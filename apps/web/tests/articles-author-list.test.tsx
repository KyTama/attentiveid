import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'

const admin: UserDto = {
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

// 105 psychologists: more than one page of 100, and more than the old default page of 20.
const everyone = Array.from({ length: 105 }, (_, i) => ({ id: `p-${String(i).padStart(3, '0')}`, name: `Psikolog ${String(i).padStart(3, '0')}` }))
everyone[104] = { id: 'p-aly', name: 'dr. Aly Lamuri' }

describe('Article editor: author choice', () => {
  const requested: string[] = []

  beforeEach(() => {
    requested.length = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/auth/refresh')) {
          return Promise.resolve({ ok: true, json: async () => ({ status: 'success', accessToken: 'valid.jwt.token', user: admin }) })
        }
        if (url.includes('/api/admin/psychologists')) {
          requested.push(url)
          const params = new URL(url, 'http://localhost').searchParams
          const limit = Math.min(100, Number(params.get('limit') ?? 20))
          const offset = Number(params.get('offset') ?? 0)
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'success', psychologists: everyone.slice(offset, offset + limit), total: everyone.length }),
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({ status: 'success', articles: [], data: [] }) })
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists every psychologist, not only the first page', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/articles']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
    fireEvent.click(await screen.findByText('+ Tulis Artikel Baru'))
    await waitFor(() => expect(screen.getByText('Penulis (Psikolog)')).toBeDefined())
    await waitFor(() => expect(requested.length).toBeGreaterThanOrEqual(2))
    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toContain('dr. Aly Lamuri')
    expect(options.filter((text) => text?.startsWith('Psikolog ') || text?.startsWith('dr. Aly')).length).toBe(105)
  })
})
