import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../src/i18n'
import { PrayerLauncher } from '../src/components/prayer/PrayerLauncher'

const fetchMock = vi.fn()

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PrayerLauncher />
    </MemoryRouter>,
  )

describe('PrayerLauncher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens from the button, checks the prayer, and sends name, city and prayer once even on a double click', async () => {
    let resolve: (value: unknown) => void = () => {}
    fetchMock.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    renderAt('/let-there-be-light')
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: /send your prayer to others/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // too short: checked before anything is sent
    await user.type(screen.getByRole('textbox', { name: /your prayer/i }), 'short')
    await user.click(screen.getByRole('button', { name: /send prayer/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/your name/i), 'Sari')
    await user.type(screen.getByLabelText(/your city/i), 'Malang')
    await user.clear(screen.getByRole('textbox', { name: /your prayer/i }))
    await user.type(screen.getByRole('textbox', { name: /your prayer/i }), 'May your day be gentle and bright.')
    const send = screen.getByRole('button', { name: /send prayer/i })
    fireEvent.click(send)
    fireEvent.click(send)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ name: 'Sari', city: 'Malang', prayer: 'May your day be gentle and bright.', website: '' })

    resolve({ ok: true, status: 201, json: async () => ({ status: 'success', data: { pendingApproval: false } }) })
    expect(await screen.findByText(/your prayer is sent/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('opens by itself when the visitor comes from the gift', () => {
    renderAt('/let-there-be-light?prayer=1')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('says when a prayer waits for approval, and shows the rate limit message', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ status: 'error', message: 'Terlalu banyak percobaan.' }) })
    renderAt('/let-there-be-light?prayer=1')
    await user.type(screen.getByRole('textbox', { name: /your prayer/i }), 'May you rest well tonight.')
    await user.click(screen.getByRole('button', { name: /send prayer/i }))
    expect(await screen.findByText(/terlalu banyak percobaan/i)).toBeInTheDocument()

    fetchMock.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ status: 'success', data: { pendingApproval: true } }) })
    await user.click(screen.getByRole('button', { name: /send prayer/i }))
    expect(await screen.findByText(/once our team has reviewed it/i)).toBeInTheDocument()
  })
})
