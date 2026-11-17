import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../src/i18n'
import { OurServicesPage, OUR_SERVICES_ORIGIN } from '../src/pages/OurServicesPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <OurServicesPage />
    </MemoryRouter>,
  )

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

  it('sizes the frame from the height the catalog reports, from its own origin only', async () => {
    const view = renderPage()
    const frame = view.container.querySelector('iframe') as HTMLIFrameElement
    const source = {}
    Object.defineProperty(frame, 'contentWindow', { value: source, configurable: true })

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'attentive-services-height', height: 2400 }, origin: 'https://evil.example', source: source as any }))
    })
    expect(frame.style.height).not.toBe('2400px')

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'attentive-services-height', height: 2400 }, origin: OUR_SERVICES_ORIGIN, source: source as any }))
    })
    expect(frame.style.height).toBe('2400px')
  })
})
