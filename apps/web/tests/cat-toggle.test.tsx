import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATS, type CatSettings } from '@attentiveid/shared'
import i18n from '../src/i18n'

let cats: CatSettings = DEFAULT_CATS
vi.mock('../src/features/site-settings/use-site-settings', () => ({
  useSiteSettings: () => ({ cats }),
  loadSiteSettings: () => Promise.resolve({ cats }),
}))

import { CatToggle } from '../src/components/common/CatToggle'
import { getCatPreference } from '../src/features/cats/cat-preference'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CatToggle />
    </MemoryRouter>,
  )

describe('CatToggle', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    window.localStorage.clear()
    cats = DEFAULT_CATS
  })

  it('starts off, turns the cats on and off for the visitor, and remembers the choice', () => {
    expect(getCatPreference()).toBe(false)
    renderAt('/')
    const button = screen.getByRole('button', { name: /play with the cats/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(getCatPreference()).toBe(true)
    expect(screen.getByRole('button', { name: /turn the cats off/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(/meow/i)

    fireEvent.click(screen.getByRole('button', { name: /turn the cats off/i }))
    expect(getCatPreference()).toBe(false)
    expect(window.localStorage.getItem('attentive-cats')).toBe('off')
  })

  it('is not there on forms, the lights page, or pages the admin turned the cats off for', () => {
    for (const path of ['/free-session', '/booking', '/let-there-be-light']) {
      const view = renderAt(path)
      expect(screen.queryByRole('button', { name: /cats/i })).toBeNull()
      view.unmount()
    }
    cats = { ...DEFAULT_CATS, enabled: false }
    renderAt('/')
    expect(screen.queryByRole('button', { name: /cats/i })).toBeNull()
  })
})
