import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATS, type CatSettings } from '@attentiveid/shared'

let cats: CatSettings = DEFAULT_CATS
vi.mock('../src/features/site-settings/use-site-settings', () => ({
  useSiteSettings: () => ({ cats }),
  loadSiteSettings: () => Promise.resolve({ cats }),
}))

import { CatsManager } from '../src/components/common/CatsManager'

const start = vi.fn(() => true)
const stop = vi.fn()

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CatsManager />
    </MemoryRouter>,
  )

describe('CatsManager', () => {
  beforeEach(() => {
    // the visitor has turned the cats on
    window.localStorage.setItem('attentive-cats', 'on')
    cats = DEFAULT_CATS
    start.mockClear()
    stop.mockClear()
    // the script is "already loaded", so nothing is downloaded in the test
    window.AttentiveCats = { start, stop, running: () => false }
    window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
  })
  afterEach(() => {
    delete window.AttentiveCats
  })

  it('keeps the cats off until the visitor turns them on, even where the admin allows them', async () => {
    window.localStorage.removeItem('attentive-cats')
    renderAt('/')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(start).not.toHaveBeenCalled()
  })

  it('starts the cats on a public page the visitor turned them on for', async () => {
    renderAt('/psychologists/syazka')
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1))
  })

  it('does not start them on the forms or the lights page', async () => {
    for (const path of ['/free-session', '/booking', '/let-there-be-light']) {
      renderAt(path)
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(start).not.toHaveBeenCalled()
  })

  it('respects the admin switches: whole site off, or one page off', async () => {
    cats = { ...DEFAULT_CATS, enabled: false }
    renderAt('/')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(start).not.toHaveBeenCalled()

    cats = { enabled: true, pages: { ...DEFAULT_CATS.pages, '/articles': false } }
    renderAt('/articles/some-article')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(start).not.toHaveBeenCalled()
    renderAt('/sci-brief')
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1))
  })

  it('stays away from visitors who ask for reduced motion', async () => {
    window.matchMedia = ((query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
    renderAt('/')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(start).not.toHaveBeenCalled()
  })
})

describe('CatsManager before the settings arrive', () => {
  it('does not start the cats on the default settings while the real ones are still loading', async () => {
    vi.resetModules()
    window.localStorage.setItem('attentive-cats', 'on')
    vi.doMock('../src/features/site-settings/use-site-settings', () => ({
      useSiteSettings: () => ({ cats: DEFAULT_CATS }),
      loadSiteSettings: () => new Promise(() => {}),
    }))
    const { CatsManager: Pending } = await import('../src/components/common/CatsManager')
    const startFn = vi.fn(() => true)
    window.AttentiveCats = { start: startFn, stop: vi.fn(), running: () => false }
    window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
    render(
      <MemoryRouter initialEntries={['/']}>
        <Pending />
      </MemoryRouter>,
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(startFn).not.toHaveBeenCalled()
    delete window.AttentiveCats
    vi.doUnmock('../src/features/site-settings/use-site-settings')
  })
})
