import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

const mockPsychologistsList = [
  {
    id: 'psych-001',
    slug: 'syazka-adira',
    status: 'active',
    name: 'Syazka Adira, M.Psi., Psikolog',
    nickname: 'Syazka',
    credential: 'M.Psi., Psikolog',
    licenseNumber: '503/SIP-049/2023',
    experienceYears: 6,
    bookingUrl: 'https://attentive.id/book/syazka',
    featured: true,
    featuredOrder: 0,
    supportAreas: [{ supportArea: 'adultClinical', primary: true }],
    media: {
      reference: 'media/psychologists/syazka.webp',
      width: 600,
      height: 600,
      alt: { id: 'Syazka', en: 'Syazka' }
    }
  }
]

describe('Psychologist CMS Page Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/auth/refresh')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'success',
              accessToken: 'valid.jwt.token',
              user: adminUser,
            }),
          })
        }
        if (url.includes('/api/admin/psychologists')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'success',
              psychologists: mockPsychologistsList,
              total: 1,
            }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success' }),
        })
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Psychologist Directory CMS for admin user and displays list', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/psychologists']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Psychologist Directory CMS')).toBeDefined()
      expect(screen.getByText('Tambah Psikolog Baru')).toBeDefined()
      expect(screen.getByText('Syazka Adira, M.Psi., Psikolog')).toBeDefined()
      expect(screen.getByText('★ #0')).toBeDefined()
    })
  })

  it('opens editor modal when "+ Tambah Psikolog Baru" button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/psychologists']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Tambah Psikolog Baru')).toBeDefined()
    })

    const addButton = screen.getByText('Tambah Psikolog Baru')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('1. Identitas & SIP')).toBeDefined()
      expect(screen.getByText('Simpan Profil Psikolog')).toBeDefined()
    })
  })
})
