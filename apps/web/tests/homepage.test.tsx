import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { LandingContentMutation } from '@attentiveid/shared'
import i18n from '../src/i18n'
import { Homepage } from '../src/components/landing/Homepage'
import { LandingContentContext } from '../src/features/content/landing-content-context'
import { psychologists } from '../src/data/psychologists'

function renderHomepage() {
  return render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  )
}

describe('homepage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('presents the new care narrative and directory routes', async () => {
    const user = userEvent.setup()
    renderHomepage()

    expect(
      screen.getByRole('heading', {
        name: /licensed clinical psychology bureau|support starts with feeling understood/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /explore services|find your psychologist/i })[0],
    ).toHaveAttribute('href', '/psychologists')
    expect(await screen.findByRole('heading', { name: /find someone you can actually talk to/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /view syazka's profile/i })).toHaveAttribute(
      'href',
      '/psychologists/syazka',
    )
    expect(await screen.findAllByRole('button', { name: /adult clinical|child and adolescent|educational|psychology scientist|ilmuwan psikologi/i })).toHaveLength(psychologists.length)
    expect(screen.getByText('20190974-2021-02-1552')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /gita adult clinical/i }))
    expect(screen.getByText('20200657-2023-02-2669')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view gita's profile/i })).toHaveAttribute('href', '/psychologists/gita')
    expect(screen.getByRole('link', { name: /read our google reviews/i })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps'),
    )
  })

  it('opens and closes FAQ answers with accessible state', async () => {
    const user = userEvent.setup()
    renderHomepage()

    const question = screen.getByRole('button', {
      name: /can i talk to someone even if i am not sure what i need help with/i,
    })

    expect(question).toHaveAttribute('aria-expanded', 'false')
    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => {
      expect(screen.getByText(/you do not need a diagnosis or a perfectly defined problem/i)).toBeVisible()
    })
    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'false')
  })

  it('switches the complete homepage to Indonesian', async () => {
    const user = userEvent.setup()
    renderHomepage()

    await user.click(screen.getAllByRole('button', { name: /switch language to bahasa indonesia/i })[0])

    expect(
      await screen.findByRole('heading', {
        name: /biro psikologi klinis & konseling profesional berizin resmi|dukungan dimulai saat kamu merasa dipahami/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /lihat layanan|temukan psikologmu/i })[0],
    ).toHaveAttribute('href', '/psychologists')
  })

  it('keeps external WhatsApp actions safe', async () => {
    renderHomepage()

    await waitFor(() => {
      expect(screen.getAllByRole('link').some((link) => link.getAttribute('href')?.startsWith('https://wa.me/'))).toBe(true)
    })

    const whatsappLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('https://wa.me/'))

    expect(whatsappLinks.length).toBeGreaterThan(0)
    for (const link of whatsappLinks) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    }
  })

  it('shows all six support choices with smart deep-links to directory filters', async () => {
    renderHomepage()

    const links = screen.getAllByRole('link', { name: /learn more:/i })
    expect(links).toHaveLength(6)
    const expectedHrefs = [
      '/psychologists?support=adultClinical',
      '/psychologists?support=educational',
      '/psychologists?q=relationship',
      '/psychologists?support=childAdolescent',
      '/psychologists?q=family',
      '/psychologists?q=career',
    ]
    links.forEach((link, index) => {
      expect(link).toHaveAttribute('href', expectedHrefs[index])
    })
    expect(screen.getByRole('heading', { name: /child and adolescent support/i })).toBeInTheDocument()
    await screen.findByRole('link', { name: /view syazka's profile/i })
  })

  it('renders hero trust metrics with accessible values', () => {
    renderHomepage()

    expect(screen.getByLabelText('3,000+')).toBeInTheDocument()
    expect(screen.getByLabelText('18')).toBeInTheDocument()
    expect(screen.getByLabelText('5.0')).toBeInTheDocument()
    expect(screen.getByLabelText('53')).toBeInTheDocument()
    expect(screen.getByText('Sessions delivered')).toBeInTheDocument()
    expect(screen.getByText('Psychologists')).toBeInTheDocument()
    expect(screen.getByText('Google rating')).toBeInTheDocument()
    expect(screen.getByText('Google reviews')).toBeInTheDocument()
  })

  it('closes mobile navigation with Escape and restores toggle focus', async () => {
    const user = userEvent.setup()
    renderHomepage()

    const toggle = screen.getByRole('button', { name: /open navigation menu/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.tab()
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('renders hero campaign redirect links safely with external target and rel', () => {
    renderHomepage()

    const freeSessionLinks = screen.getAllByRole('link', { name: /first free session/i })
    expect(freeSessionLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of freeSessionLinks) {
      expect(link).toHaveAttribute('href', 'https://free-session.attentiveid.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    }

    const bookingLinks = screen.getAllByRole('link', { name: /booking \/ reserve psychologist/i })
    expect(bookingLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of bookingLinks) {
      expect(link).toHaveAttribute('href', 'https://booking.attentiveid.com/')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    }

    const assessmentLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.includes('assessment.attentiveid.com'))
    expect(assessmentLinks).toHaveLength(0)
  })

  it('supports editable, adjustable, hideable, and deletable featured campaigns & portals', () => {
    const localized = (id: string, en: string) => ({ id, en })
    const customHeroSection: LandingContentMutation['sections'][0] = {
      key: 'hero',
      visible: true,
      headline: localized('Headline ID', 'Headline EN'),
      description: localized('Desc ID', 'Desc EN'),
      primaryCta: localized('Mulai', 'Start'),
      secondaryCta: localized('Eksplor', 'Explore'),
      items: [
        { id: 'm1', position: 0, title: localized('Sesi', 'Sessions'), description: localized('3,000+', '3,000+') },
        { id: 'm2', position: 1, title: localized('Psikolog', 'Psychologists'), description: localized('18', '18') },
        { id: 'm3', position: 2, title: localized('Rating', 'Rating'), description: localized('5.0', '5.0') },
      ],
      campaigns: {
        visible: true,
        showFloatingDock: false,
        eyebrow: localized('Portal Kustom', 'Custom Initiatives & Portals'),
        description: localized('Subjudul Kustom', 'Custom portal subtitle'),
        cards: [
          {
            id: 'custom-1',
            visible: true,
            theme: 'emerald',
            icon: 'shield',
            badge: localized('EKSKLUSIF', 'EXCLUSIVE'),
            title: localized('Layanan Korporat', 'Enterprise Care Portal'),
            description: localized('Solusi B2B', 'Dedicated B2B wellness portal'),
            cta: localized('Buka Portal', 'Launch Portal'),
            url: 'https://booking.attentiveid.com/enterprise',
          },
          {
            id: 'hidden-2',
            visible: false,
            theme: 'gold',
            icon: 'gift',
            badge: localized('HIDDEN', 'HIDDEN'),
            title: localized('Kartu Tersembunyi', 'Hidden Campaign Card'),
            description: localized('Disembunyikan', 'Should not render'),
            cta: localized('Klaim', 'Claim'),
            url: 'https://free-session.attentiveid.com',
          },
        ],
      },
    }

    const { unmount } = render(
      <MemoryRouter>
        <LandingContentContext.Provider
          value={{
            locale: 'en',
            content: { sections: [customHeroSection] as unknown as LandingContentMutation['sections'] },
          }}
        >
          <Homepage />
        </LandingContentContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Custom Initiatives & Portals')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Enterprise Care Portal' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Hidden Campaign Card' })).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: /featured campaigns/i })).not.toBeInTheDocument()

    unmount()

    // Now test hiding the entire Featured Campaigns & Portals section
    render(
      <MemoryRouter>
        <LandingContentContext.Provider
          value={{
            locale: 'en',
            content: {
              sections: [
                {
                  ...customHeroSection,
                  campaigns: {
                    ...customHeroSection.campaigns!,
                    visible: false,
                  },
                },
              ] as unknown as LandingContentMutation['sections'],
            },
          }}
        >
          <Homepage />
        </LandingContentContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Custom Initiatives & Portals')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Enterprise Care Portal' })).not.toBeInTheDocument()
  })

  it('renders all 5 attentive_hero_v3 slides, supports tab switching, and enforces safe coming-soon CTA & visibility toggling', async () => {
    const user = userEvent.setup()
    const { unmount } = renderHomepage()

    // All 5 v3 carousel tabs are rendered
    const practiceTab = screen.getByRole('tab', { name: /our practice/i })
    const petTab = screen.getByRole('tab', { name: /pet garden/i })
    const big10Tab = screen.getByRole('tab', { name: /free big 10 \+ session/i })
    const briefTab = screen.getByRole('tab', { name: /scientific brief/i })
    const ellaTab = screen.getByRole('tab', { name: /meet ella/i })

    expect(practiceTab).toHaveAttribute('aria-selected', 'true')
    expect(petTab).toBeInTheDocument()
    expect(big10Tab).toBeInTheDocument()
    expect(briefTab).toBeInTheDocument()
    expect(ellaTab).toBeInTheDocument()

    // Switch to Slide 02 (Pet garden)
    await user.click(petTab)
    expect(screen.getByRole('heading', { name: /come in\. make yourself at home/i })).toBeInTheDocument()

    // Switch to Slide 03 (Free Big 10 + session): Big 10 links to big10.attentiveid.com safely
    await user.click(big10Tab)
    expect(screen.getByRole('heading', { name: /see your personality/i })).toBeInTheDocument()
    const big10Link = screen.getByRole('link', { name: /take the big 10/i })
    expect(big10Link).toHaveAttribute('href', 'https://big10.attentiveid.com/')
    expect(big10Link).toHaveAttribute('target', '_blank')
    expect(big10Link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.getByRole('link', { name: /claim your first session/i })).toHaveAttribute(
      'href',
      'https://free-session.attentiveid.com',
    )

    // Switch to Slide 04 (Scientific brief): both buttons route to /articles
    await user.click(briefTab)
    expect(screen.getByRole('heading', { name: /research, made readable/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read the latest brief/i })).toHaveAttribute('href', '/articles')
    expect(screen.getByRole('link', { name: /all briefs/i })).toHaveAttribute('href', '/articles')

    // Switch to Slide 05 (Meet Ella): links to Ella's detail profile
    await user.click(ellaTab)
    expect(screen.getByRole('heading', { name: /steady hands for hard stories/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get to know ella/i })).toHaveAttribute('href', '/psychologists/gisella')

    unmount()

    // Verify per-slide visibility filtering from CMS hides disabled slides
    const localized = (id: string, en: string) => ({ id, en })
    const heroWithHiddenSlide = {
      key: 'hero',
      visible: true,
      headline: localized('Ruang tenang.', 'Come in. **Make yourself comfortable.**'),
      description: localized('Deskripsi.', 'Description.'),
      primaryCta: localized('Mulai', 'Find your psychologist'),
      primaryCtaUrl: '/psychologists',
      secondaryCta: localized('Lokasi', 'Visit our Kemang studio'),
      secondaryCtaUrl: '#locations',
      slideItems: [
        {
          id: 'practice',
          visible: true,
          layout: 'practice',
          tabLabel: localized('Ruang kami', 'Our practice'),
          tag: localized('Layanan', 'Welcome in'),
          headline: localized('Masuklah.', 'Come in.'),
          description: localized('Deskripsi 1.', 'Desc 1.'),
          primaryCta: localized('Cari psikolog', 'Find your psychologist'),
          primaryCtaUrl: '',
        },
        {
          id: 'big10-offer',
          visible: false,
          layout: 'big10',
          tabLabel: localized('Big 10 tersembunyi', 'Hidden Big 10 Slide'),
          tag: localized('Tersembunyi', 'Hidden'),
          headline: localized('Tersembunyi', 'Hidden Slide Heading'),
          description: localized('Tidak tampil', 'Not rendered'),
          primaryCta: localized('Mulai', 'Take the Big 10'),
          primaryCtaUrl: '',
        },
      ],
      items: [
        { id: 'metric-1', position: 0, title: localized('Sesi', 'Sessions'), description: localized('3,000+', '3,000+') },
        { id: 'metric-2', position: 1, title: localized('Psikolog', 'Psychologists'), description: localized('18', '18') },
        { id: 'metric-3', position: 2, title: localized('Rating', 'Rating'), description: localized('5.0', '5.0') },
      ],
    }

    render(
      <MemoryRouter>
        <LandingContentContext.Provider
          value={{
            locale: 'en',
            content: { sections: [heroWithHiddenSlide] as unknown as LandingContentMutation['sections'] },
          }}
        >
          <Homepage />
        </LandingContentContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: /our practice/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /hidden big 10 slide/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find your psychologist.*soon/i })).toBeDisabled()
  })
})
