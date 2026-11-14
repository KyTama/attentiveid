import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'

// pdf.js needs a real browser; the preview component is exercised separately.
vi.mock('../src/components/sci-brief/PdfPreview', () => ({
  PdfPreview: ({ url }: { url: string }) => <div data-testid="pdf-preview" data-url={url} />,
}))

const brief = (overrides: Record<string, unknown> = {}) => ({
  id: 'b1',
  slug: 'being-liked',
  title: { id: 'Menjadi Disukai', en: 'Being Liked' },
  summary: { id: 'Ringkasan singkat', en: 'A short summary' },
  periodMonth: '2026-09',
  releaseAt: '2026-09-01T00:00:00.000Z',
  totalPages: 8,
  previewPages: 3,
  previewUrl: '/api/content/sci-briefs/being-liked/preview.pdf',
  ...overrides,
})

const respond = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )

describe('public Sci-Brief pages', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists briefs as cards with title, short description and a read button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'success', briefs: [brief()] })))
    renderAt('/sci-brief')

    const card = (await screen.findByRole('heading', { name: /Being Liked|Menjadi Disukai/ })).closest('li') as HTMLElement
    expect(within(card).getByText(/short summary|Ringkasan singkat/i)).toBeDefined()
    const button = within(card).getByRole('link', { name: /read brief|baca brief/i })
    expect(button.getAttribute('href')).toBe('/sci-brief/being-liked')
  })

  it('shows an empty state when nothing is released', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'success', briefs: [] })))
    renderAt('/sci-brief')
    expect(await screen.findByText(/no sci-brief has been released|belum ada sci-brief/i)).toBeDefined()
  })

  it('shows the preview, then a locked section with email and WhatsApp request links', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'success', brief: brief() })))
    renderAt('/sci-brief/being-liked')

    const preview = await screen.findByTestId('pdf-preview')
    expect(preview.getAttribute('data-url')).toContain('/api/content/sci-briefs/being-liked/preview.pdf')
    expect(screen.getByText(/5 more pages|5 halaman lainnya/i)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /request to see more|minta akses/i }))
    const email = screen.getByRole('link', { name: /email/i })
    const whatsapp = screen.getByRole('link', { name: /whatsapp/i })
    expect(email.getAttribute('href')).toMatch(/^mailto:contact@attentiveid\.com\?subject=/)
    expect(decodeURIComponent(email.getAttribute('href') as string)).toMatch(/Being Liked|Menjadi Disukai/)
    expect(whatsapp.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  })

  it('does not lock anything when the whole document fits in the preview', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'success', brief: brief({ totalPages: 3 }) })))
    renderAt('/sci-brief/being-liked')
    await screen.findByTestId('pdf-preview')
    expect(screen.queryByRole('button', { name: /request to see more|minta akses/i })).toBeNull()
  })

  it('shows a friendly message for a brief that is not released', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'notFound' }, 404)))
    renderAt('/sci-brief/nope')
    expect(await screen.findByText(/not found|tidak ditemukan/i)).toBeDefined()
  })
})

describe('header Products dropdown', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond({ status: 'success', briefs: [] })))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('holds Service, Sci-Brief and Article', async () => {
    renderAt('/sci-brief')
    const toggle = await screen.findByRole('button', { name: /products|produk/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('true'))

    const menu = document.getElementById(toggle.getAttribute('aria-controls') as string) as HTMLElement
    const links = within(menu).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/#support', '/sci-brief', '/articles'])
  })
})
