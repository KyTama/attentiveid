import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` })
const repeater = (prefix: string) => Array.from({ length: 3 }, (_, position) => ({
  id: `${prefix}-${position}`,
  position,
  title: localized(`${prefix} title ${position}`),
  description: localized(`${prefix} description ${position}`),
}))
const validLandingContent = {
  sections: [
    { key: 'hero', visible: true, headline: localized('Hero'), description: localized('Hero desc'), primaryCta: localized('Start'), secondaryCta: localized('Explore'), items: repeater('metric') },
    { key: 'supportExplorer', visible: true, headline: localized('Support'), description: localized('Support desc'), items: repeater('support') },
    { key: 'carePromise', visible: true, headline: localized('Promise'), description: localized('Promise desc'), items: repeater('promise') },
    { key: 'featuredPsychologists', visible: true, headline: localized('Featured'), description: localized('Featured desc') },
    { key: 'careJourney', visible: true, headline: localized('Journey'), description: localized('Journey desc'), items: repeater('journey') },
    { key: 'clientStories', visible: true, headline: localized('Stories'), description: localized('Stories desc'), items: repeater('stories') },
    { key: 'consultationReassurance', visible: true, headline: localized('Reassurance'), description: localized('Reassurance desc'), sessionLabel: localized('Session'), price: localized('Price'), priceUnit: localized('Unit'), primaryCta: localized('Book') },
    { key: 'frequentlyAskedQuestions', visible: true, headline: localized('FAQ'), description: localized('FAQ desc'), items: repeater('faq') },
    { key: 'closingInvitation', visible: true, headline: localized('Closing'), description: localized('Closing desc'), primaryCta: localized('Contact'), contact: localized('WhatsApp') },
  ],
}

describe('Landing & Testimonials CMS Page Components', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Landing Content Editor for admin user and requests capability token for Preview Draft', async () => {
    const mockOpenWindow = { opener: null as any, location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(mockOpenWindow as any)

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/api/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', accessToken: 'valid.jwt.token', user: adminUser }),
        })
      }
      if (url.endsWith('/api/admin/landing/preview') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', capability: 'signed.preview.cap' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'success', content: validLandingContent }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

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

    fireEvent.click(screen.getByText('Preview Draft ↗'))
    await waitFor(() => {
      expect(mockOpenWindow.location.href).toBe('/preview/landing#capability=signed.preview.cap')
    })
  })

  it('TestimonialsCmsPage publishes unwrapped LandingContentMutation payload directly (not wrapped in { content })', async () => {
    let publishBody: any = null
    let draftBody: any = null

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/api/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', accessToken: 'valid.jwt.token', user: adminUser }),
        })
      }
      if (url.endsWith('/api/admin/landing/draft') && init?.method === 'PUT') {
        draftBody = JSON.parse(String(init.body))
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', revision: { content: draftBody } }),
        })
      }
      if (url.endsWith('/api/admin/landing/publish') && init?.method === 'POST') {
        publishBody = JSON.parse(String(init.body))
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', revisionId: 'rev-pub-1', content: publishBody }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'success', content: validLandingContent }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/dashboard/testimonials']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Manajemen Testimoni Klien')).toBeDefined()
      expect(screen.getAllByText('stories title 0 ID').length).toBeGreaterThan(0)
      expect((screen.getByText('Simpan Draft').closest('button') as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(screen.getByText('Simpan Draft'))
    await waitFor(() => {
      expect(draftBody).not.toBeNull()
      expect(Array.isArray(draftBody.sections)).toBe(true)
      expect(draftBody.content).toBeUndefined()
    })

    await waitFor(() => {
      expect((screen.getByText('Terbitkan ke Homepage').closest('button') as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(screen.getByText('Terbitkan ke Homepage'))
    await waitFor(() => {
      expect(publishBody).not.toBeNull()
      expect(Array.isArray(publishBody.sections)).toBe(true)
      expect(publishBody.content).toBeUndefined()
    })
  })

  it('LandingCmsPage auto-repairs duplicate item IDs and out-of-sequence positions before Save Draft', async () => {
    let savedDraftBody: any = null
    const dirtyContent = structuredClone(validLandingContent) as any
    dirtyContent.sections[5].items[1].id = dirtyContent.sections[5].items[0].id
    dirtyContent.sections[5].items[2].position = 99

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/api/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', accessToken: 'valid.jwt.token', user: adminUser }),
        })
      }
      if (url.endsWith('/api/admin/landing/draft') && init?.method === 'PUT') {
        savedDraftBody = JSON.parse(String(init.body))
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success', revision: { content: savedDraftBody } }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'success', content: dirtyContent }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/dashboard/landing']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Landing Content Editor')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Simpan Draft'))
    await waitFor(() => {
      expect(savedDraftBody).not.toBeNull()
      const stories = savedDraftBody.sections.find((s: any) => s.key === 'clientStories')
      expect(new Set(stories.items.map((i: any) => i.id)).size).toBe(stories.items.length)
      expect(stories.items.map((i: any) => i.position)).toEqual([0, 1, 2])
    })
  })
})
