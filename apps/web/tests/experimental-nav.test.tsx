import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'
import { canAccessExperimental } from '../src/features/experimental/access'

const makeAdmin = (email: string): UserDto => ({
  id: `user-${email}`,
  email,
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

const experimentalAdmin = makeAdmin('nico.alex.ha@gmail.com')
const otherAdmin = makeAdmin('admin@attentive.id')

function signInAs(user: UserDto) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', accessToken: 'valid.token', user }),
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

describe('dashboard Experimental section', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('matches the allowlisted email case-insensitively and nothing else', () => {
    expect(canAccessExperimental('Nico.Alex.HA@gmail.com ')).toBe(true)
    expect(canAccessExperimental('admin@attentive.id')).toBe(false)
    expect(canAccessExperimental(null)).toBe(false)
  })

  it('shows Experimental with Forms, Events and Sesi Gratis for the allowlisted account', async () => {
    signInAs(experimentalAdmin)
    const user = userEvent.setup()
    renderAt('/dashboard')

    const toggle = await screen.findByRole('button', { name: /experimental/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Sesi Gratis no longer sits at the top level.
    expect(screen.queryByRole('link', { name: /sesi gratis/i })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const group = document.getElementById(toggle.getAttribute('aria-controls') as string) as HTMLElement
    expect(within(group).getByRole('link', { name: 'Forms' })).toHaveAttribute('href', '/dashboard/experimental/forms')
    expect(within(group).getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/dashboard/experimental/events')
    expect(within(group).getByRole('link', { name: 'Sesi Gratis' })).toHaveAttribute('href', '/dashboard/free-session')
  })

  it('hides Experimental from other admins', async () => {
    signInAs(otherAdmin)
    renderAt('/dashboard')

    await screen.findByText(/selamat datang, admin user/i)
    expect(screen.queryByRole('button', { name: /experimental/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sesi gratis/i })).not.toBeInTheDocument()
  })

  it.each(['/dashboard/free-session', '/dashboard/experimental/forms', '/dashboard/experimental/events'])(
    'blocks other admins from %s',
    async (path) => {
      signInAs(otherAdmin)
      renderAt(path)
      await waitFor(() => expect(screen.getByText(/403 -/i)).toBeInTheDocument())
    },
  )

  it('opens the Forms page empty for the allowlisted account', async () => {
    signInAs(experimentalAdmin)
    renderAt('/dashboard/experimental/forms')

    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeInTheDocument()
    expect(screen.getByText(/belum ada form/i)).toBeInTheDocument()
    // The group opens by itself when one of its pages is active.
    expect(screen.getByRole('button', { name: /experimental/i })).toHaveAttribute('aria-expanded', 'true')
  })
})
