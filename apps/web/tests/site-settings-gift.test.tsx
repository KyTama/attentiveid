import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SITE_SETTINGS, type GiftSettings, type SiteSettings } from '@attentiveid/shared'
import i18n from '../src/i18n'

const saveGift = vi.fn(async (gift: GiftSettings): Promise<SiteSettings> => ({ ...DEFAULT_SITE_SETTINGS, gift }))

vi.mock('../src/features/admin-tools/service', () => {
  class AdminToolsApiError extends Error {
    fieldErrors: Record<string, string>
    constructor(message: string, fieldErrors: Record<string, string> = {}) {
      super(message)
      this.fieldErrors = fieldErrors
    }
  }
  return {
    AdminToolsApiError,
    getAdminSiteSettings: async () => DEFAULT_SITE_SETTINGS,
    saveBrowserTabSettings: vi.fn(),
    saveFloatingBarSettings: vi.fn(),
    saveCatSettings: vi.fn(),
    saveGiftSettings: (gift: GiftSettings) => saveGift(gift),
    uploadSharePreviewImage: vi.fn(async () => '/media/share/new-gift.webp'),
  }
})

import { SiteSettingsPage } from '../src/pages/dashboard/SiteSettingsPage'
import { AdminToolsApiError } from '../src/features/admin-tools/service'

const renderPage = () =>
  render(
    <MemoryRouter>
      <SiteSettingsPage />
    </MemoryRouter>,
  )

const giftSection = async () => {
  const heading = await screen.findByRole('heading', { name: /gift for visitors/i })
  return heading.closest('section') as HTMLElement
}

describe('Pengaturan Situs > gift section', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    saveGift.mockClear()
  })

  it('starts from the defaults, lets the admin choose pages, how often, and what the letter says, and saves it', async () => {
    renderPage()
    const section = await giftSection()
    const view = within(section)

    // home on by default; articles off; forms and the prayer page are locked off
    expect(view.queryByRole('checkbox', { name: /sender/i })).toBeNull()
    expect(view.getByText(/completely anonymous/i)).toBeInTheDocument()
    expect(view.getByRole('checkbox', { name: /^Home/ })).toBeChecked()
    expect(view.getByRole('checkbox', { name: /Articles/ })).not.toBeChecked()
    for (const name of [/Free Session form/, /Booking form/, /Let There Be Light/]) {
      expect(view.getByRole('checkbox', { name })).toBeDisabled()
    }

    fireEvent.click(view.getByRole('checkbox', { name: /Articles/ }))
    fireEvent.change(view.getByRole('combobox', { name: /how often/i }), { target: { value: 'always' } })
    fireEvent.change(view.getByRole('combobox', { name: /new prayers from visitors/i }), { target: { value: 'manual' } })
    fireEvent.change(view.getByRole('textbox', { name: /Letter text \(English\)/ }), { target: { value: 'Dear friend,\n[Prayer]' } })
    fireEvent.click(view.getByRole('button', { name: /^Save gift$/ }))

    await waitFor(() => expect(saveGift).toHaveBeenCalledTimes(1))
    const sent = saveGift.mock.calls[0][0]
    expect(sent.pages['/articles']).toBe(true)
    expect(sent.pages['/']).toBe(true)
    expect(sent.frequency).toBe('always')
    expect(sent.moderation).toBe('manual')
    expect(sent).not.toHaveProperty('showName')
    expect(sent).not.toHaveProperty('showCity')
    expect(sent.messageEn).toBe('Dear friend,\n[Prayer]')
    expect(await screen.findByText(/gift settings saved/i)).toBeInTheDocument()
  })

  it('uploads a gift picture, can go back to the default box, and shows field errors from the server', async () => {
    saveGift.mockRejectedValueOnce(new AdminToolsApiError('Pengaturan hadiah belum valid.', { messageEn: 'Teks surat harus memuat [Prayer]' }))
    renderPage()
    const section = await giftSection()
    const view = within(section)

    const fileInput = section.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'gift.webp', { type: 'image/webp' })] } })
    await waitFor(() => expect(section.querySelector('img')).toHaveAttribute('src', '/media/share/new-gift.webp'))
    fireEvent.click(view.getAllByRole('button', { name: /use default/i })[0])
    await waitFor(() => expect(section.querySelectorAll('img')).toHaveLength(0))

    fireEvent.click(view.getByRole('button', { name: /^Save gift$/ }))
    expect(await screen.findByText(/Teks surat harus memuat \[Prayer\]/)).toBeInTheDocument()
  })
})
