import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../src/App'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/free-session']}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /belum, ini pertama kali/i }))
  await user.type(screen.getByLabelText(/nama lengkap/i), 'Nico Testerson')
  await user.type(screen.getByLabelText(/umur/i), '24')
  await user.type(screen.getByLabelText(/nomor whatsapp aktif/i), '0812-3456-7890')
  await user.selectOptions(screen.getByLabelText(/keluhan umum/i), 'cemas')
  await user.click(screen.getByRole('checkbox', { name: /saya setuju dihubungi/i }))
}

describe('/free-session page', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders at /free-session with the eligibility question first', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 1, name: /ruang yang aman untuk memulai cerita kamu/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /belum, ini pertama kali/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/nama lengkap/i)).not.toBeInTheDocument()
  })

  it('sets a page-specific document title and restores it on leave', () => {
    document.title = 'Original'
    const { unmount } = renderPage()
    expect(document.title).toMatch(/sesi gratis 60 menit/i)
    unmount()
    expect(document.title).toBe('Original')
  })

  it('moves focus to the first invalid field after a failed submit', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('radio', { name: /belum, ini pertama kali/i }))
    await user.click(screen.getByRole('button', { name: /daftar sesi gratis/i }))
    await waitFor(() => expect(screen.getByLabelText(/nama lengkap/i)).toHaveFocus())
  })

  it('sends returning users to regular booking and never shows the form', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('radio', { name: /sudah pernah/i }))
    expect(screen.getByText(/program ini khusus pengguna baru attentive/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /booking reguler/i })).toHaveAttribute(
      'href',
      'https://booking.attentiveid.com',
    )
    expect(screen.queryByLabelText(/nama lengkap/i)).not.toBeInTheDocument()
  })

  it('shows field errors and does not call the API for invalid input', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('radio', { name: /belum, ini pertama kali/i }))
    await user.click(screen.getByRole('button', { name: /daftar sesi gratis/i }))

    expect(await screen.findByText(/mohon isi nama lengkap/i)).toBeInTheDocument()
    expect(screen.getByText(/nomor whatsapp tidak valid/i)).toBeInTheDocument()
    expect(screen.getByText(/pilih salah satu keluhan/i)).toBeInTheDocument()
    expect(screen.getByText(/persetujuan diperlukan/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits to the API and hands off to WhatsApp', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 201, json: async () => ({ status: 'success' }) })
    const user = userEvent.setup()
    renderPage()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /daftar sesi gratis/i }))

    const link = await screen.findByRole('link', { name: /lanjut ke whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('Keluhan: Cemas / panik')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/api\/public\/free-session$/)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toMatchObject({
      eligible: 'baru',
      name: 'Nico Testerson',
      age: '24',
      keluhan: 'cemas',
      agreed: true,
      website: '',
    })
  })

  it('shows a retryable message when the API is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    renderPage()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /daftar sesi gratis/i }))

    expect(await screen.findByText(/formulir belum terkirim/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /lanjut ke whatsapp/i })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: /daftar sesi gratis/i })).toBeEnabled())
  })

  it('surfaces the rate limit message from the API', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ status: 'error', message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' }),
    })
    const user = userEvent.setup()
    renderPage()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /daftar sesi gratis/i }))

    const alert = await screen.findByText(/terlalu banyak percobaan/i)
    expect(within(alert.parentElement as HTMLElement).queryByRole('link')).not.toBeInTheDocument()
  })
})
