import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HEADER_FOOTER, DEFAULT_SITE_SETTINGS } from '@attentiveid/shared'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { setSiteSettings } from '@/features/site-settings/use-site-settings'
import '@/i18n'

afterEach(() => {
  cleanup()
  setSiteSettings(DEFAULT_SITE_SETTINGS)
  vi.unstubAllGlobals()
})

describe('edited top menu and footer', () => {
  it('shows the saved texts and links, and leaves out hidden or emptied entries', async () => {
    const headerFooter = structuredClone(DEFAULT_HEADER_FOOTER)
    headerFooter.header.items[0] = { id: 'promo', visible: true, label: { id: 'Promo baru', en: 'New promo' }, url: 'https://example.com/promo', children: [] }
    headerFooter.header.items[4].visible = false
    headerFooter.header.cta.visible = false
    headerFooter.footer.whatsappNumber = '+62 812-0000-1111'
    headerFooter.footer.linkedinUrl = ''
    headerFooter.footer.copyright = { id: 'Attentive.', en: 'Attentive.' }
    // The settings request never answers, so only what the test puts in is shown.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    setSiteSettings({ ...DEFAULT_SITE_SETTINGS, headerFooter })

    render(
      <MemoryRouter>
        <SiteHeader />
        <SiteFooter />
      </MemoryRouter>,
    )

    const promo = await screen.findByRole('link', { name: /new promo|promo baru/i })
    expect(promo.getAttribute('href')).toBe('https://example.com/promo')
    expect(promo.getAttribute('target')).toBe('_blank')
    await waitFor(() => expect(screen.queryByText(/plan a session|konsultasi sekarang/i)).toBeNull())
    // FAQ is hidden in the header but still listed in the footer.
    expect(screen.getAllByRole('link', { name: /^(faq|tanya jawab)$/i })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /0812-0000|812-0000-1111/ }).getAttribute('href')).toContain('https://wa.me/6281200001111?text=')
    expect(screen.queryByText(/linkedin/i)).toBeNull()
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Attentive\\.$`))).toBeDefined()
  })
})
