import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'

const admin: UserDto = {
  id: 'user-admin',
  email: 'admin@attentive.id',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

function renderDashboard() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'success', accessToken: 'valid.token', user: admin }) }),
  )
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('dashboard sidebar', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('en')
  })

  it('groups the menus instead of listing them all at the top level', async () => {
    renderDashboard()
    await screen.findByText(/selamat datang, admin user/i)
    const aside = screen.getAllByRole('navigation')[0]
    for (const group of [/konten website/i, /tim & psikolog/i, /riset & publikasi/i, /operasional/i, /pengaturan/i]) {
      expect(aside.querySelector('button[aria-expanded]') && screen.getAllByRole('button', { name: group }).length).toBeGreaterThan(0)
    }
    // A page only appears once its group is opened.
    expect(screen.queryAllByRole('link', { name: /thumbnail link/i })).toHaveLength(0)
    await userEvent.setup().click(screen.getAllByRole('button', { name: /konten website/i })[0])
    expect(screen.getAllByRole('link', { name: /thumbnail link/i }).length).toBeGreaterThan(0)
  })

  it('searches the menus and opens the chosen page', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText(/selamat datang, admin user/i)

    const search = screen.getAllByRole('combobox', { name: /cari menu portal/i })[0]
    await user.type(search, 'whatsapp')
    const option = await screen.findByRole('option', { name: /thumbnail link/i })
    expect(option).toHaveTextContent('Konten Website')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('heading', { name: /thumbnail link/i })).toBeInTheDocument())
  })

  it('says so when nothing matches', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText(/selamat datang, admin user/i)
    await user.type(screen.getAllByRole('combobox', { name: /cari menu portal/i })[0], 'zzzz')
    expect(await screen.findByText(/tidak ada menu untuk/i)).toBeInTheDocument()
  })

  it('follows the language toggle: switching to English translates the menus and the overview', async () => {
    renderDashboard()
    await screen.findByText(/selamat datang, admin user/i)
    expect(screen.getAllByRole('button', { name: /konten website/i }).length).toBeGreaterThan(0)

    await act(async () => {
      await i18n.changeLanguage('en')
    })
    expect(await screen.findByText(/welcome, admin user/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /website content/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /konten website/i })).not.toBeInTheDocument()
    expect(screen.getByText(/system operations summary/i)).toBeInTheDocument()
  })
})
