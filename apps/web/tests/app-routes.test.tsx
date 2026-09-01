import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { PsychologistProfileDetails } from '../src/components/psychologists/PsychologistProfileDetails'
import type { PsychologistProfile } from '../src/features/psychologists'
import i18n from '../src/i18n'

describe('public routes', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders the psychologist directory route', async () => {
    render(
      <MemoryRouter initialEntries={['/psychologists']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: /find someone who feels right for you/i })
    expect(heading).toBeInTheDocument()
    await waitFor(() => expect(heading).toHaveFocus())
    expect(await screen.findByRole('link', { name: /view syazka's profile/i })).toBeInTheDocument()
  })

  it('renders a valid psychologist profile route', async () => {
    render(
      <MemoryRouter initialEntries={['/psychologists/syazka']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const heading = await screen.findByRole('heading', { name: 'Syazka Kirani Narindra' })
    expect(heading).toBeInTheDocument()
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('link', { name: /ask about syazka on whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    )
    expect(screen.getByRole('link', { name: /ask about syazka on whatsapp/i })).toHaveAttribute('target', '_blank')
    expect(screen.getByText(/20190974-2021-02-1552/i)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /view gita's profile/i })).toHaveAttribute(
      'href',
      '/psychologists/gita',
    )
    expect(screen.queryByRole('link', { name: /view syazka's profile/i })).not.toBeInTheDocument()
  })

  it('renders an explicit not-found state for an unknown psychologist slug', async () => {
    render(
      <MemoryRouter initialEntries={['/psychologists/unknown-person']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const heading = await screen.findByRole('heading', { name: /psychologist profile not found/i })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('link', { name: /return to the directory/i })).toHaveAttribute('href', '/psychologists')
    expect(screen.getByRole('link', { name: /ask our admin/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    )
  })

  it('degrades safely when optional profile credentials are missing', () => {
    const psychologist: PsychologistProfile = {
      bookingUrl: 'https://wa.me/6285156410912',
      credential: 'M.Psi., Psikolog',
      experienceLabel: '3 Tahun',
      experienceYears: 3,
      imageUrl: '/images/psychologists/placeholder.png',
      name: 'Placeholder Psychologist',
      nickname: 'Placeholder',
      slug: 'placeholder',
      specializations: ['Anxiety support'],
      supportArea: 'adultClinical',
    }

    render(<PsychologistProfileDetails psychologist={psychologist} />)

    expect(screen.queryByText(/practice license/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /continue on whatsapp/i })).toHaveAttribute(
      'href',
      psychologist.bookingUrl,
    )
  })

  it('renders the localized not-found route', () => {
    render(
      <MemoryRouter initialEntries={['/missing-route']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
