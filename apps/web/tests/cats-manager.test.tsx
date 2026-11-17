import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATS, type CatSettings } from '@attentiveid/shared'

let cats: CatSettings = DEFAULT_CATS
vi.mock('../src/features/site-settings/use-site-settings', () => ({
  useSiteSettings: () => ({ cats }),
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

  it('starts the cats on a public page by default', async () => {
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
