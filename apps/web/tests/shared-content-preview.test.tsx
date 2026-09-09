import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LandingContentMutation } from '@attentiveid/shared'
import i18n from '../src/i18n'

const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` })
const items = (prefix: string, count = 3) => Array.from({ length: count }, (_, position) => ({
  id: `${prefix}-${position}`,
  position,
  title: localized(`${prefix} title ${position}`),
  description: localized(`${prefix} description ${position}`),
}))

const draftContent: LandingContentMutation = {
  sections: [
    { key: 'hero', visible: true, headline: localized('Draft hero'), description: localized('Draft hero description'), primaryCta: localized('Draft primary'), secondaryCta: localized('Draft secondary') },
    { key: 'supportExplorer', visible: true, headline: localized('Draft support'), description: localized('Draft support description'), items: items('support') },
    { key: 'carePromise', visible: true, headline: localized('Draft promise'), description: localized('Draft promise description'), items: items('promise') },
    { key: 'featuredPsychologists', visible: true, headline: localized('Draft featured'), description: localized('Draft featured description') },
    { key: 'careJourney', visible: true, headline: localized('Draft journey'), description: localized('Draft journey description'), items: items('journey') },
    { key: 'clientStories', visible: true, headline: localized('Draft stories'), description: localized('Draft stories description'), items: items('story') },
    { key: 'consultationReassurance', visible: true, headline: localized('Draft reassurance'), description: localized('Draft reassurance description') },
    { key: 'frequentlyAskedQuestions', visible: true, headline: localized('Draft FAQ'), description: localized('Draft FAQ description'), items: items('faq') },
    { key: 'closingInvitation', visible: true, headline: localized('Draft closing'), description: localized('Draft closing description'), primaryCta: localized('Draft closing action'), contact: localized('Draft contact') },
  ],
}

const previewEnvelope = {
  status: 'preview' as const,
  preview: { landingRevisionId: 'landing-revision-draft', expiresAt: '2026-09-10T02:00:00.000Z' },
  landing: {
    revision: {
      id: 'landing-revision-draft',
      aggregateId: 'landing-aggregate',
      revisionNumber: 2,
      basedOnRevisionId: 'landing-revision-published',
      status: 'draft' as const,
      createdAt: '2026-09-10T01:00:00.000Z',
      publishedAt: null,
    },
    content: draftContent,
  },
}

describe('shared landing preview', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    vi.resetModules()
    window.history.replaceState(null, '', '/')
    await i18n.changeLanguage('en')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('captures the exact fragment once and scrubs it synchronously', async () => {
    const capability = 'preview-secret.token_value'
    window.history.replaceState(null, '', `/preview/landing#capability=${encodeURIComponent(capability)}`)

    const bootstrap = await import('../src/features/content/preview-bootstrap')

    expect(window.location.pathname).toBe('/preview/landing')
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('')
    expect(bootstrap.consumePreviewCapability()).toBe(capability)
    expect(bootstrap.consumePreviewCapability()).toBeNull()
    expect(window.localStorage?.getItem('capability')).toBeFalsy()
    expect(window.sessionStorage?.getItem('capability')).toBeFalsy()
  })

  it('rejects non-exact preview locations without rewriting them', async () => {
    window.history.replaceState(null, '', '/preview/landing?source=email#capability=should-not-be-captured')

    const bootstrap = await import('../src/features/content/preview-bootstrap')

    expect(bootstrap.consumePreviewCapability()).toBeNull()
    expect(window.location.search).toBe('?source=email')
    expect(window.location.hash).toBe('#capability=should-not-be-captured')
  })

  it('scrubs malformed exact capability fragments without retaining them', async () => {
    window.history.replaceState(null, '', '/preview/landing#capability=%E0%A4%A')

    const bootstrap = await import('../src/features/content/preview-bootstrap')

    expect(window.location.href).not.toContain('capability')
    expect(bootstrap.consumePreviewCapability()).toBeNull()
  })

  it('exchanges the capability only in a fixed-path JSON body, then reads by cookie', async () => {
    const capability = 'one-shot-preview-secret'
    window.history.replaceState(null, '', `/preview/landing#capability=${capability}`)
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ready' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(previewEnvelope), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const { loadPreviewLandingContent } = await import('../src/features/content/service')
    await expect(loadPreviewLandingContent()).resolves.toEqual({ status: 'success', content: draftContent })

    expect(window.location.href).not.toContain(capability)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/preview/landing/session')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      body: JSON.stringify({ capability }),
      cache: 'no-store',
      credentials: 'include',
      method: 'POST',
    })
    expect(JSON.stringify(fetchMock.mock.calls[0]?.[1]?.headers)).not.toContain(capability)
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/preview/landing')
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ cache: 'no-store', credentials: 'include', method: 'GET' })
    expect(JSON.stringify(fetchMock.mock.calls[1])).not.toContain(capability)
  })

  it('uses only the scoped session read on refresh and keeps failures generic', async () => {
    window.history.replaceState(null, '', '/preview/landing')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'invalidPreview' }), { status: 403 }))
    vi.stubGlobal('fetch', fetchMock)

    const { loadPreviewLandingContent } = await import('../src/features/content/service')
    await expect(loadPreviewLandingContent()).resolves.toEqual({ status: 'unavailable' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/preview/landing', expect.objectContaining({ method: 'GET' }))
  })

  it('renders a valid draft through the same PublicLayout and Homepage tree', async () => {
    const { AppRoutes } = await import('../src/App')
    render(
      <MemoryRouter initialEntries={['/preview/landing']}>
        <AppRoutes previewLandingLoader={async () => ({ status: 'success', content: draftContent })} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Draft hero EN' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Draft support EN' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Draft closing EN' })).toBeInTheDocument()
    expect(screen.getByText('support title 0 EN')).toBeInTheDocument()
  })

  it('renders published content through the same provider and Homepage tree', async () => {
    const { AppRoutes } = await import('../src/App')
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes landingContentLoader={async () => ({ status: 'success', content: draftContent })} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Draft hero EN' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Draft FAQ EN' })).toBeInTheDocument()
  })

  it('renders one non-reflective unavailable state without public fallback', async () => {
    const capability = 'must-never-reach-the-dom'
    const { AppRoutes } = await import('../src/App')
    render(
      <MemoryRouter initialEntries={['/preview/landing']}>
        <AppRoutes previewLandingLoader={async () => ({ status: 'unavailable' })} />
      </MemoryRouter>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: /preview is unavailable/i })).toBeInTheDocument())
    expect(document.documentElement.outerHTML).not.toContain(capability)
    expect(screen.queryByRole('heading', { name: /support starts with feeling understood/i })).not.toBeInTheDocument()
  })

  it('loads the scrub bootstrap before every other application import and keeps proxy routes fragment-blind', async () => {
    const [{ default: mainSource }, { default: localCaddy }, { default: deployCaddy }] = await Promise.all([
      import('../src/main.tsx?raw'),
      import('../Caddyfile?raw'),
      import('../../../deploy/Caddyfile?raw'),
    ])
    const firstImport = mainSource.split('\n').find((line) => line.startsWith('import'))

    expect(firstImport).toContain('preview-bootstrap')
    expect(localCaddy).not.toContain('{http.request.uri.fragment}')
    expect(deployCaddy).not.toContain('{http.request.uri.fragment}')
    expect(deployCaddy).not.toMatch(/log_append.*body/i)
  })
})
