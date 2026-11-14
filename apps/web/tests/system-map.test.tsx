import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'
import { MAP_EDGES, MAP_NODES } from '../src/features/system-map/map-data'

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

const signInAs = (user: UserDto) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'success', accessToken: 'valid.token', user }) }),
  )

const renderMap = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/experimental/system-map']}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )

describe('System Map', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('only references nodes that exist', () => {
    const ids = new Set(MAP_NODES.map((node) => node.id))
    expect(ids.size).toBe(MAP_NODES.length)
    for (const edge of MAP_EDGES) {
      expect(ids.has(edge.from), edge.from).toBe(true)
      expect(ids.has(edge.to), edge.to).toBe(true)
    }
  })

  it('opens for the allowlisted account and is listed in the Experimental menu', async () => {
    signInAs(makeAdmin('nico.alex.ha@gmail.com'))
    renderMap()

    expect(await screen.findByRole('heading', { name: 'System Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'System Map' })).toHaveAttribute('href', '/dashboard/experimental/system-map')
  })

  it('shows details and connections when a box is selected', async () => {
    signInAs(makeAdmin('nico.alex.ha@gmail.com'))
    renderMap()
    await screen.findByRole('heading', { name: 'System Map' })

    fireEvent.click(screen.getByRole('button', { name: /^Kartu hero \(kode\)/ }))
    const panel = screen.getByRole('complementary', { name: /detail kotak/i })
    expect(within(panel).getByRole('heading', { name: 'Kartu hero (kode)' })).toBeInTheDocument()
    expect(within(panel).getByText(/kutipan di hero tidak ikut berubah/i)).toBeInTheDocument()
    expect(within(panel).getByText('Hero beranda')).toBeInTheDocument()
  })

  it('hides lines of a status when its filter is switched off', async () => {
    signInAs(makeAdmin('nico.alex.ha@gmail.com'))
    const { container } = renderMap()
    await screen.findByRole('heading', { name: 'System Map' })

    const codeLines = () => container.querySelectorAll('path[stroke="#d97706"]').length
    expect(codeLines()).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /terkunci di kode/i, pressed: true }))
    expect(codeLines()).toBe(0)
  })

  it('is closed to other admins', async () => {
    signInAs(makeAdmin('admin@attentive.id'))
    renderMap()
    await waitFor(() => expect(screen.getByText(/403 -/i)).toBeInTheDocument())
  })
})
