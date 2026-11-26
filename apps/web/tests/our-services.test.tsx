import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../src/i18n'
import { OurServicesPage, OUR_SERVICES_ORIGIN } from '../src/pages/OurServicesPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <OurServicesPage />
    </MemoryRouter>,
  )

describe('our services page: opening a service directly', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })

  it('opens the service named after the # in the address inside the frame, and keeps it in the new-tab link', () => {
    const view = render(
      <MemoryRouter initialEntries={['/our-services#detail-p-konseling-dewasa']}>
        <OurServicesPage />
      </MemoryRouter>,
    )
    const frame = view.container.querySelector('iframe') as HTMLIFrameElement
    expect(frame.getAttribute('src')).toBe(`${OUR_SERVICES_ORIGIN}/?lang=id#detail-p-konseling-dewasa`)
    expect(screen.getAllByRole('link', { name: /tab baru/i })[0]).toHaveAttribute('href', `${OUR_SERVICES_ORIGIN}/?lang=id#detail-p-konseling-dewasa`)
  })

  it('ignores an odd fragment', () => {
    const view = render(
      <MemoryRouter initialEntries={['/our-services#"><script>']}>
        <OurServicesPage />
      </MemoryRouter>,
    )
    expect((view.container.querySelector('iframe') as HTMLIFrameElement).getAttribute('src')).toBe(`${OUR_SERVICES_ORIGIN}/?lang=id`)
  })
})

describe('our services page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })

  it('opens the catalog in the current language and tells it when the language changes', async () => {
    const view = renderPage()
    const frame = view.container.querySelector('iframe') as HTMLIFrameElement
    expect(frame.getAttribute('src')).toBe(`${OUR_SERVICES_ORIGIN}/?lang=id`)

    const post = vi.fn()
    Object.defineProperty(frame, 'contentWindow', { value: { postMessage: post }, configurable: true })

    await act(async () => {
      await i18n.changeLanguage('en')
    })
    expect(post).toHaveBeenLastCalledWith({ type: 'attentive-lang', lang: 'en' }, OUR_SERVICES_ORIGIN)
    // the frame is not reloaded
    expect(frame.getAttribute('src')).toBe(`${OUR_SERVICES_ORIGIN}/?lang=id`)
    expect(screen.getAllByRole('link', { name: /open in a new tab/i })[0]).toHaveAttribute('href', `${OUR_SERVICES_ORIGIN}/?lang=en`)
  })

  it('keeps the frame as tall as the window, so the catalog chat assistant stays in view, whatever height the catalog reports', async () => {
    const view = renderPage()
    const frame = view.container.querySelector('iframe') as HTMLIFrameElement
    const source = {}
    Object.defineProperty(frame, 'contentWindow', { value: source, configurable: true })
    expect(frame.className).toContain('flex-1')

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'attentive-services-height', height: 2400 }, origin: OUR_SERVICES_ORIGIN, source: source as any }))
    })
    expect(frame.className).toContain('flex-1')
  })
})

describe('/our-services/<slug>', () => {
  let go: (to: string) => void
  let path = ''
  function Spy() {
    go = useNavigate()
    path = useLocation().pathname
    return null
  }
  const at = (start: string) =>
    render(
      <MemoryRouter initialEntries={[start]}>
        <Spy />
        <Routes>
          <Route element={<OurServicesPage />} path="our-services/:slug?" />
        </Routes>
      </MemoryRouter>,
    )
  const frameOf = (view: ReturnType<typeof at>) => view.container.querySelector('iframe') as HTMLIFrameElement
  const say = (frame: HTMLIFrameElement, data: unknown, origin = OUR_SERVICES_ORIGIN) =>
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data, origin, source: frame.contentWindow as any }))
    })

  it('opens that service, follows the catalog in the address and the new-tab link, and obeys a later site link', () => {
    const view = at('/our-services/p-konseling-anak')
    const frame = frameOf(view)
    expect(frame.src).toContain('#detail-p-konseling-anak')
    const newTab = () => view.container.querySelector('a[target="_blank"][href^="' + OUR_SERVICES_ORIGIN + '"]') as HTMLAnchorElement

    say(frame, { type: 'attentive-service', id: 'p-konseling-family' })
    say(frame, { type: 'attentive-service', id: '../dashboard' })
    say(frame, { type: 'attentive-service', id: 'p-other' }, 'https://example.com')
    expect(path).toBe('/our-services/p-konseling-family')
    expect(newTab().href).toContain('#detail-p-konseling-family')
    // The frame that already shows it is left alone.
    expect(frameOf(view)).toBe(frame)
    expect(frame.src).toContain('#detail-p-konseling-anak')

    // "Layanan kami" in the header: the catalog starts again at the list.
    act(() => go('/our-services'))
    expect(frameOf(view)).not.toBe(frame)
    expect(frameOf(view).src).not.toContain('#detail-')
    view.unmount()
  })

  it('takes a sane height from the catalog: one page scroll, the footer, and the visible part sent back', () => {
    const view = at('/our-services')
    const frame = frameOf(view)
    const post = vi.spyOn(frame.contentWindow as Window, 'postMessage')
    for (const height of [10, 1e9, Number.NaN, '2000']) say(frame, { type: 'attentive-height', height })
    say(frame, { type: 'attentive-height', height: 2000 }, 'https://example.com')
    expect(frame.style.height).toBe('')
    expect(view.container.querySelector('footer')).toBeNull()

    say(frame, { type: 'attentive-height', height: 2400.2 })
    expect(frame.style.height).toBe('2401px')
    expect(view.container.querySelector('footer')).not.toBeNull()
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'attentive-viewport' }), OUR_SERVICES_ORIGIN)
    post.mockClear()
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'attentive-viewport', top: expect.any(Number), height: expect.any(Number) }), OUR_SERVICES_ORIGIN)
    view.unmount()
  })
})
