import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_GIFT, DEFAULT_CATS, type GiftSettings } from '@attentiveid/shared'
import i18n from '../src/i18n'
import { GIFT_STEP_SIZES, GROW_INTERVAL_MS, NO_CAT_START_DELAY_MS } from '../src/features/gift/gift-timeline'

let gift: GiftSettings = DEFAULT_GIFT
vi.mock('../src/features/site-settings/use-site-settings', () => ({
  useSiteSettings: () => ({ gift, cats: DEFAULT_CATS }),
  loadSiteSettings: () => Promise.resolve({ gift, cats: DEFAULT_CATS }),
}))
vi.mock('../src/features/prayer/service', () => ({
  fetchGiftPrayer: () => Promise.resolve({ text: 'Semoga kamu tenang.', name: 'Sari', city: 'Malang' }),
}))

import { GiftManager } from '../src/components/gift/GiftManager'

function Where() {
  const location = useLocation()
  return <p data-testid="where">{location.pathname + location.search}</p>
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <GiftManager />
      <Routes>
        <Route element={<Where />} path="*" />
      </Routes>
    </MemoryRouter>,
  )

const flush = async (ms: number) => {
  // twice: the settings promise settles first, and only then does the start timer get set
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe('GiftManager (cats off)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    gift = { ...DEFAULT_GIFT, pages: { ...DEFAULT_GIFT.pages, '/articles': true } }
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a small gift on entry, grows it step by step until it covers the screen, then opens the letter and asks about the prayer', async () => {
    renderAt('/')
    await flush(10)
    const small = screen.getByRole('button', { name: /open your gift/i })
    expect(small).toBeInTheDocument()
    const sizeOf = () => (document.querySelector('.gift-box') as HTMLElement).style.getPropertyValue('--s')
    expect(sizeOf()).toBe(`${GIFT_STEP_SIZES[0]}px`)

    // nothing happens until the wait is over, then one bigger step at a time
    await flush(NO_CAT_START_DELAY_MS - 100)
    expect(sizeOf()).toBe(`${GIFT_STEP_SIZES[0]}px`)
    await flush(200)
    expect(sizeOf()).toBe(`${GIFT_STEP_SIZES[1]}px`)
    await flush(GROW_INTERVAL_MS)
    expect(sizeOf()).toBe(`${GIFT_STEP_SIZES[2]}px`)
    for (let i = 0; i < GIFT_STEP_SIZES.length; i += 1) await flush(GROW_INTERVAL_MS)

    const cover = document.querySelector('.gift-cover') as HTMLElement
    expect(cover).not.toBeNull()
    expect(screen.queryByText(/click me/i)).toBeNull()

    fireEvent.click(cover)
    await flush(10)
    const letter = screen.getByRole('dialog')
    expect(letter).toHaveTextContent('Hi there!')
    expect(letter).toHaveTextContent('Semoga kamu tenang.')
    expect(letter).toHaveTextContent('— Sari, Malang')
    expect(letter).not.toHaveTextContent('[Prayer]')

    fireEvent.click(screen.getByRole('button', { name: /close the letter/i }))
    await flush(10)
    expect(screen.getByRole('heading', { name: /send your prayer to other/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /yes, take me there/i }))
    await flush(10)
    expect(screen.getByTestId('where')).toHaveTextContent('/let-there-be-light?prayer=1')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens when the small gift is clicked, and the "not now" answer also goes to the prayer page', async () => {
    renderAt('/')
    await flush(10)
    fireEvent.click(screen.getByRole('button', { name: /open your gift/i }))
    await flush(10)
    fireEvent.click(screen.getByRole('button', { name: /close the letter/i }))
    await flush(10)
    fireEvent.click(screen.getByRole('button', { name: /i'll pass for now/i }))
    await flush(10)
    expect(screen.getByTestId('where')).toHaveTextContent('/let-there-be-light')
    expect(screen.getByTestId('where')).not.toHaveTextContent('prayer=1')
  })

  it('hides the name and city when the admin says so, and uses the admin letter text', async () => {
    gift = { ...DEFAULT_GIFT, showName: false, showCity: false, messageEn: 'Dear friend,\n[Prayer]\nBye' }
    renderAt('/')
    await flush(10)
    fireEvent.click(screen.getByRole('button', { name: /open your gift/i }))
    await flush(10)
    const letter = screen.getByRole('dialog')
    expect(letter).toHaveTextContent('Dear friend,')
    expect(letter).not.toHaveTextContent('Sari')
    expect(letter).not.toHaveTextContent('Malang')
  })

  it('is not shown on pages that are off, on forms, or on the prayer page, and not twice in one session', async () => {
    for (const path of ['/psychologists', '/free-session', '/booking', '/let-there-be-light']) {
      const view = renderAt(path)
      await flush(50)
      expect(screen.queryByRole('button', { name: /open your gift/i })).toBeNull()
      view.unmount()
    }
    const first = renderAt('/articles/some-article')
    await flush(50)
    expect(screen.getByRole('button', { name: /open your gift/i })).toBeInTheDocument()
    first.unmount()
    renderAt('/articles/some-article')
    await flush(50)
    expect(screen.queryByRole('button', { name: /open your gift/i })).toBeNull()
  })

  it('shows on every visit when the admin chose "always", and not at all when switched off', async () => {
    gift = { ...DEFAULT_GIFT, frequency: 'always' }
    const first = renderAt('/')
    await flush(50)
    expect(screen.getByRole('button', { name: /open your gift/i })).toBeInTheDocument()
    first.unmount()
    const second = renderAt('/')
    await flush(50)
    expect(screen.getByRole('button', { name: /open your gift/i })).toBeInTheDocument()
    second.unmount()

    gift = { ...DEFAULT_GIFT, enabled: false }
    renderAt('/')
    await flush(50)
    expect(screen.queryByRole('button', { name: /open your gift/i })).toBeNull()
  })

  it('lets the visitor skip a gift that covers the screen', async () => {
    renderAt('/')
    await flush(10)
    for (let i = 0; i < 12; i += 1) await flush(GROW_INTERVAL_MS)
    expect(document.querySelector('.gift-cover')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    await flush(10)
    expect(document.querySelector('.gift-cover')).toBeNull()
  })
})
