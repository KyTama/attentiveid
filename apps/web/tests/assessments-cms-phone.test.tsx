import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'

const staff = (role: 'admin' | 'psychologist'): UserDto => ({
  id: `user-${role}`,
  email: `${role}@attentive.id`,
  name: role === 'admin' ? 'Admin User' : 'Psikolog User',
  role,
  status: 'active',
  psychologistId: role === 'psychologist' ? 'p1' : null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

function renderOldPage(role: 'admin' | 'psychologist') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const json = url.includes('/api/auth/') ? { status: 'success', accessToken: 'valid.token', user: staff(role) } : { status: 'success', data: [] }
      return { ok: true, status: 200, json: async () => json }
    }),
  )
  render(
    <MemoryRouter initialEntries={['/dashboard/assessments']}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('old "Hasil Asesmen" page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('tells a psychologist without clients that results appear after an admin assigns them (Bahasa)', async () => {
    await i18n.changeLanguage('id')
    renderOldPage('psychologist')
    expect(await screen.findByText('Hasil akan muncul di sini setelah admin menugaskan klien kepada Anda.')).toBeInTheDocument()
    expect(screen.queryByText('Belum ada data.')).not.toBeInTheDocument()
  })

  it('says it in English too', async () => {
    await i18n.changeLanguage('en')
    renderOldPage('psychologist')
    expect(await screen.findByText('Results will appear here after an admin assigns clients to you.')).toBeInTheDocument()
  })

  it('keeps the plain empty text for an admin', async () => {
    await i18n.changeLanguage('id')
    renderOldPage('admin')
    expect(await screen.findByText('Belum ada data.')).toBeInTheDocument()
    expect(screen.queryByText(/setelah admin menugaskan/)).not.toBeInTheDocument()
  })

  it('links to the MHCU dashboard', async () => {
    await i18n.changeLanguage('id')
    renderOldPage('admin')
    expect(await screen.findByRole('link', { name: /buka dasbor mhcu/i })).toHaveAttribute('href', '/dashboard/assessments/mhcu')
  })
})

describe('portal menu drawer on a phone', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })

  it('scrolls (overflow-y), fits the visible screen (dvh) and keeps room for the home bar', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/dashboard/DashboardLayout.tsx'), 'utf8')
    const drawer = source.slice(source.indexOf('Mobile Navigation Drawer'))
    expect(drawer).toContain('h-dvh overflow-y-auto overscroll-contain')
    expect(drawer).toContain('env(safe-area-inset-bottom)')
  })
})
