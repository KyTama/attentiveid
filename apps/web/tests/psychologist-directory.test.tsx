import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location-search">{location.search}</output>
}

function HistoryControls() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)} type="button">History back</button>
}

function renderDirectory(initialEntry = '/psychologists', includeHistoryControls = false) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
      <LocationProbe />
      {includeHistoryControls && <HistoryControls />}
    </MemoryRouter>,
  )
}

function currentSearchParams() {
  return new URLSearchParams(screen.getByTestId('location-search').textContent ?? '')
}

describe('psychologist directory', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('hydrates combined search and filters from the URL', async () => {
    renderDirectory('/psychologists?q=brainspotting&support=adultClinical&experience=midLevel')

    expect(screen.getByRole('searchbox', { name: /search the directory/i })).toHaveValue('brainspotting')
    expect(screen.getByRole('button', { name: 'Adults' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '3–6 years' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('link', { name: /view gita's profile/i })).toHaveAttribute(
      'href',
      '/psychologists/gita',
    )
    expect(screen.queryByRole('link', { name: /view syazka's profile/i })).not.toBeInTheDocument()
    expect(screen.getByText('1 psychologist')).toBeInTheDocument()
  })

  it('writes filter state to history and restores it on back navigation', async () => {
    const user = userEvent.setup()
    renderDirectory('/psychologists', true)

    await user.click(screen.getByRole('button', { name: 'Adults' }))
    await waitFor(() => expect(currentSearchParams().get('support')).toBe('adultClinical'))

    await user.click(screen.getByRole('button', { name: 'Education and development' }))
    await waitFor(() => expect(currentSearchParams().get('support')).toBe('educational'))

    await user.click(screen.getByRole('button', { name: 'History back' }))
    await waitFor(() => expect(currentSearchParams().get('support')).toBe('adultClinical'))
    expect(screen.getByRole('button', { name: 'Adults' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears every query parameter and restores the full directory', async () => {
    const user = userEvent.setup()
    renderDirectory('/psychologists?q=syazka&support=adultClinical&experience=midLevel')

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent(''))
    expect(screen.getByRole('searchbox', { name: /search the directory/i })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'All support areas' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('link', { name: /view syazka's profile/i })).toBeInTheDocument()
  })

  it('keeps an empty search actionable', async () => {
    const user = userEvent.setup()
    renderDirectory()

    await user.type(screen.getByRole('searchbox', { name: /search the directory/i }), 'zzzz-no-match')

    await waitFor(() => expect(currentSearchParams().get('q')).toBe('zzzz-no-match'))
    expect(await screen.findByRole('heading', { name: /no exact match yet/i })).toBeInTheDocument()
    expect(screen.getByText('0 psychologists')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reset filters/i }))
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent(''))
    expect(await screen.findByRole('link', { name: /view syazka's profile/i })).toBeInTheDocument()
  })

  it('navigates from a directory card to the psychologist profile', async () => {
    const user = userEvent.setup()
    renderDirectory('/psychologists?q=syazka')

    await user.click(await screen.findByRole('link', { name: /view syazka's profile/i }))

    expect(await screen.findByRole('heading', { name: 'Syazka Kirani Narindra' })).toBeInTheDocument()
  })
})
