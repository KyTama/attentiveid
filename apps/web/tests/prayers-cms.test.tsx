import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrayerAdminDto } from '@attentiveid/shared'
import i18n from '../src/i18n'

const state: { rows: PrayerAdminDto[] } = { rows: [] }
const hidden = vi.fn(async (id: string, value: boolean) => {
  state.rows = state.rows.map((row) => (row.id === id ? { ...row, hidden: value } : row))
})
const removed = vi.fn(async (id: string) => {
  state.rows = state.rows.filter((row) => row.id !== id)
})

vi.mock('../src/features/admin-tools/service', () => ({
  listAdminPrayers: async () => state.rows,
  setPrayerHidden: (id: string, value: boolean) => hidden(id, value),
  deleteAdminPrayer: (id: string) => removed(id),
}))

import { PrayersCmsPage } from '../src/pages/dashboard/PrayersCmsPage'

const row = (id: string, prayer: string, extra: Partial<PrayerAdminDto> = {}): PrayerAdminDto => ({
  id,
  prayer,
  hidden: false,
  createdAt: '2026-11-17T03:00:00.000Z',
  ...extra,
})

describe('PrayersCmsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    hidden.mockClear()
    removed.mockClear()
    state.rows = [row('a', 'May your day be calm.'), row('b', 'Rest well tonight.', { hidden: true })]
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('lists prayers, filters them, hides/shows one and deletes one', async () => {
    render(
      <MemoryRouter>
        <PrayersCmsPage />
      </MemoryRouter>,
    )
    expect(await screen.findByText('May your day be calm.')).toBeInTheDocument()
    expect(screen.getByText('Rest well tonight.')).toBeInTheDocument()
    expect(screen.getByText(/2 of 2 prayers/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Hidden \(1\)/ }))
    expect(screen.queryByText('May your day be calm.')).toBeNull()
    expect(screen.getByText('Rest well tonight.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^All$/ }))

    const first = screen.getByText('May your day be calm.').closest('li') as HTMLElement
    fireEvent.click(within(first).getByRole('button', { name: /^Hide$/ }))
    await waitFor(() => expect(hidden).toHaveBeenCalledWith('a', true))

    const second = screen.getByText('Rest well tonight.').closest('li') as HTMLElement
    fireEvent.click(within(second).getByRole('button', { name: /^Show$/ }))
    await waitFor(() => expect(hidden).toHaveBeenCalledWith('b', false))

    fireEvent.click(within(first).getByRole('button', { name: /delete prayer/i }))
    await waitFor(() => expect(removed).toHaveBeenCalledWith('a'))
    await waitFor(() => expect(screen.queryByText('May your day be calm.')).toBeNull())
  })

  it('searches the prayers, and shows them as anonymous', async () => {
    render(
      <MemoryRouter>
        <PrayersCmsPage />
      </MemoryRouter>,
    )
    await screen.findByText('May your day be calm.')
    expect(screen.getAllByText(/anonymous/i).length).toBeGreaterThan(0)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'calm' } })
    expect(screen.getByText('May your day be calm.')).toBeInTheDocument()
    expect(screen.queryByText('Rest well tonight.')).toBeNull()
  })
})
