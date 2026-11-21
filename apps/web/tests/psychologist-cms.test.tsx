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
      // The name also appears in the Featured order panel.
      expect(screen.getAllByText('Syazka Adira, M.Psi., Psikolog').length).toBeGreaterThan(0)
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

  it('shows the Featured order panel only on the "Semua" tab', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/psychologists']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText('Urutan Featured')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: 'draft' }))
    await waitFor(() => expect(screen.queryByText('Urutan Featured')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: /^Semua/ }))
    expect(await screen.findByText('Urutan Featured')).toBeDefined()
  })

  it('allows consecutive photo replacements including re-selecting the same file and updates saved media reference', async () => {
    let savedMediaRef = 'media/psychologists/syazka.webp'
    let uploadCount = 0

    class MockImage {
      naturalWidth = 600
      naturalHeight = 750
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', MockImage as any)
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:mock-${++uploadCount}`)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
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
      if (url.includes('/api/admin/psychologists/upload-photo') && init?.method === 'POST') {
        const ref = `media/psychologists/syazka-v${uploadCount}.webp`
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            message: 'Foto profil psikolog berhasil diunggah!',
            media: {
              id: `media-${uploadCount}`,
              reference: ref,
              width: 600,
              height: 750,
              alt: { id: 'Syazka', en: 'Syazka' },
            },
          }),
        })
      }
      if (url.endsWith('/api/admin/psychologists/psych-001') && init?.method === 'PUT') {
        const body = JSON.parse(String(init.body || '{}'))
        savedMediaRef = body.media?.reference || savedMediaRef
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            psychologist: {
              ...mockPsychologistsList[0],
              media: {
                reference: savedMediaRef,
                width: 600,
                height: 750,
                alt: { id: 'Syazka', en: 'Syazka' },
              },
            },
          }),
        })
      }
      if (url.endsWith('/api/admin/psychologists/psych-001')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            psychologist: {
              ...mockPsychologistsList[0],
              shortBio: { id: 'Short', en: 'Short' },
              biography: { id: 'Bio ID', en: 'Bio EN' },
              availabilityMessage: { id: 'Tersedia', en: 'Available' },
              specializations: [{ id: 'spec-0', label: { id: 'Konseling', en: 'Counseling' } }],
              media: {
                reference: savedMediaRef,
                width: 600,
                height: 750,
                alt: { id: 'Syazka', en: 'Syazka' },
              },
            },
          }),
        })
      }
      if (url.includes('/api/admin/psychologists')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            psychologists: [
              {
                ...mockPsychologistsList[0],
                media: {
                  reference: savedMediaRef,
                  width: 600,
                  height: 750,
                  alt: { id: 'Syazka', en: 'Syazka' },
                },
              },
            ],
            total: 1,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'success' }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/dashboard/psychologists']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    )

    const editButtons = await screen.findAllByRole('button', { name: 'Edit' })
    fireEvent.click(editButtons[0])

    await screen.findByText('Edit Profil Psikolog')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()

    const firstFile = new File(['img-1'], 'photo.webp', { type: 'image/webp' })
    fireEvent.change(fileInput, { target: { files: [firstFile] } })
    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([u]) => String(u).includes('/upload-photo'))).toHaveLength(1)
    })
    expect(fileInput.value).toBe('')

    // Second upload (consecutive replacement while modal is open)
    const secondFile = new File(['img-2'], 'photo2.webp', { type: 'image/webp' })
    fireEvent.change(fileInput, { target: { files: [secondFile] } })
    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([u]) => String(u).includes('/upload-photo'))).toHaveLength(2)
    })
    expect(fileInput.value).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Profil Psikolog' }))

    await waitFor(() => {
      expect(savedMediaRef).toBe('media/psychologists/syazka-v2.webp')
    })
  })
})
