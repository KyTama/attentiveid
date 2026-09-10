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

const mockArticle = {
  id: 'art-001',
  slug: 'memahami-kecemasan-dan-cara-mengatasinya',
  status: 'published',
  title: { id: 'Memahami Kecemasan', en: 'Understanding Anxiety' },
  summary: { id: 'Ringkasan artikel kecemasan', en: 'Anxiety summary' },
  body: { id: 'Isi artikel kecemasan...', en: 'Anxiety body text...' },
  publishedAt: '2026-09-01T12:00:00Z',
}

describe('Public Articles & Article CMS Pages', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders public /articles directory page with articles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          articles: [mockArticle],
          total: 1,
        }),
      })
    )

    render(
      <MemoryRouter initialEntries={['/articles']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Artikel & Edukasi Psikologi')).toBeDefined()
      expect(screen.getByText(/Understanding Anxiety|Memahami Kecemasan/i)).toBeDefined()
    })
  })

  it('renders public /articles/:slug detail reader page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          article: mockArticle,
        }),
      })
    )

    render(
      <MemoryRouter initialEntries={['/articles/memahami-kecemasan-dan-cara-mengatasinya']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Understanding Anxiety|Memahami Kecemasan/i)).toBeDefined()
      expect(screen.getByText(/Anxiety summary|Ringkasan artikel kecemasan/i)).toBeDefined()
    })
  })

  it('renders Article CMS page inside /dashboard/articles for admin', async () => {
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
            articles: [mockArticle],
          }),
        })
      })
    )

    render(
      <MemoryRouter initialEntries={['/dashboard/articles']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Manajemen Artikel Psikologi')).toBeDefined()
      expect(screen.getByText('+ Tulis Artikel Baru')).toBeDefined()
    })
  })
})
