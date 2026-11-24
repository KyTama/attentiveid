import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'
import { MHCU_WIKI } from '../src/features/wiki/mhcu-wiki'

const makeUser = (role: UserDto['role']): UserDto => ({
  id: `user-${role}`,
  email: `${role}@attentive.id`,
  name: 'Staff User',
  role,
  status: 'active',
  psychologistId: role === 'psychologist' ? 'psy-1' : null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

const calls: string[] = []

function signInAs(user: UserDto) {
  calls.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (url: string) => {
      calls.push(String(url))
      return { ok: true, status: 200, json: async () => ({ status: 'success', accessToken: 'valid.token', user, data: [] }) }
    }),
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('admin dashboard update', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
    localStorage.clear()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('admin-dark', 'dark')
    await i18n.changeLanguage('en')
  })

  it('groups every form under Formulir, with a sub menu per form', async () => {
    signInAs(makeUser('admin'))
    const user = userEvent.setup()
    renderAt('/dashboard/account')

    const forms = await screen.findByRole('button', { name: 'Formulir' })
    await user.click(forms)
    const panel = document.getElementById(forms.getAttribute('aria-controls') as string) as HTMLElement
    expect(within(panel).getByRole('link', { name: 'Semua Aktivitas Formulir' })).toHaveAttribute('href', '/dashboard/forms')
    expect(within(panel).getByRole('button', { name: 'MHCU' })).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Goal System Compass' })).toBeInTheDocument()
  })

  it('opens the MHCU sub menu by itself on a MHCU page', async () => {
    signInAs(makeUser('admin'))
    renderAt('/dashboard/assessments/mhcu/invites')

    expect(await screen.findByRole('link', { name: 'Undangan MHCU' })).toHaveAttribute('href', '/dashboard/assessments/mhcu/invites')
    expect(screen.getByRole('link', { name: 'Pengaturan MHCU' })).toBeInTheDocument()
  })

  it('shows a psychologist the forms they can use but not the admin pages', async () => {
    signInAs(makeUser('psychologist'))
    const user = userEvent.setup()
    renderAt('/dashboard/account')

    const forms = await screen.findByRole('button', { name: 'Formulir' })
    await user.click(forms)
    await user.click(screen.getByRole('button', { name: 'MHCU' }))
    expect(screen.getByRole('link', { name: 'Dasbor MHCU' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Undangan MHCU' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pengaturan MHCU' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Konten Website' })).not.toBeInTheDocument()
  })

  it('opens the MHCU wiki with a contents list that matches the sections', async () => {
    signInAs(makeUser('psychologist'))
    renderAt('/dashboard/wiki/mhcu')

    expect(await screen.findByRole('heading', { name: /wiki mhcu/i, level: 1 })).toBeInTheDocument()
    const contents = screen.getByRole('navigation', { name: 'Daftar isi' })
    expect(within(contents).getAllByRole('link')).toHaveLength(MHCU_WIKI.length)
    expect(within(screen.getByRole('main')).getAllByRole('heading', { level: 2 })).toHaveLength(MHCU_WIKI.length)
  })

  it('has a Bahasa and an English text for every wiki line', () => {
    const empty: string[] = []
    const check = (pair: readonly [string, string]) => {
      if (!pair[0].trim() || !pair[1].trim()) empty.push(pair.join(' | '))
    }
    for (const section of MHCU_WIKI) {
      check(section.title)
      for (const block of section.blocks) {
        if (block.kind === 'p' || block.kind === 'note' || block.kind === 'link') check(block.text)
        if (block.kind === 'steps' || block.kind === 'bullets') block.items.forEach(check)
        if (block.kind === 'table') {
          block.head.forEach(check)
          block.rows.forEach((row) => row.forEach(check))
        }
      }
    }
    expect(empty).toEqual([])
  })

  it('toggles the dark theme for the portal only and remembers it', async () => {
    signInAs(makeUser('admin'))
    const user = userEvent.setup()
    const view = renderAt('/dashboard/account')

    const toggle = await screen.findByRole('button', { name: 'Ganti ke tema gelap' })
    expect(document.documentElement).not.toHaveClass('admin-dark')
    await user.click(toggle)
    expect(document.documentElement).toHaveClass('admin-dark')
    expect(localStorage.getItem('attentive-admin-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Ganti ke tema terang' })).toHaveAttribute('aria-pressed', 'true')

    // leaving the portal removes the dark class, so the public site is never dark
    view.unmount()
    expect(document.documentElement).not.toHaveClass('admin-dark')
  })

  it('checks the new password on the page before asking the server', async () => {
    signInAs(makeUser('psychologist'))
    const user = userEvent.setup()
    renderAt('/dashboard/account')

    await screen.findByRole('heading', { name: 'Pengaturan Akun' })
    await user.type(screen.getByLabelText('Password saat ini'), 'old-password-123')
    await user.type(screen.getByLabelText('Password baru'), 'a-new-password-1')
    await user.type(screen.getByLabelText('Ulangi password baru'), 'a-different-one-2')
    await user.click(screen.getByRole('button', { name: 'Ganti password' }))

    expect(await screen.findByText('Pengulangan password tidak sama.')).toBeInTheDocument()
    expect(calls.some((url) => url.includes('/api/auth/me/password'))).toBe(false)
  })

  it('shows the role access table on the System Map for the allowlisted account', async () => {
    signInAs({ ...makeUser('admin'), email: 'nico.alex.ha@gmail.com' })
    renderAt('/dashboard/experimental/system-map')

    expect(await screen.findByRole('heading', { name: 'Akses per peran' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Halaman portal' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Tindakan penting' })).toBeInTheDocument()
  })
})
