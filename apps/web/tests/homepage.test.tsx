import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../src/i18n'
import { Homepage } from '../src/components/landing/Homepage'

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
    renderHomepage()

    expect(screen.getByRole('heading', { name: /support starts with feeling understood/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /find your psychologist/i })[0]).toHaveAttribute(
      'href',
      '/psychologists',
    )
    expect(await screen.findByRole('heading', { name: /find someone you can actually talk to/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /view syazka's profile/i })).toHaveAttribute(
      'href',
      '/psychologists/syazka',
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
      await screen.findByRole('heading', { name: /dukungan dimulai saat kamu merasa dipahami/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /temukan psikologmu/i })[0]).toHaveAttribute(
      'href',
      '/psychologists',
    )
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
})
