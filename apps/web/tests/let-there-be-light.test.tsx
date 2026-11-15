import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../src/App'
import { STORE_KEY } from '../src/features/let-there-be-light/script'

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
}

describe('/let-there-be-light route', () => {
  beforeEach(() => {
    localStorage.clear()
    document.title = 'Initial Title'
    document.documentElement.lang = 'en'
    mockReducedMotion(true)
  })

  afterEach(() => {
    mockReducedMotion(false)
    localStorage.clear()
  })

  it('mounts on /let-there-be-light with dedicated typography, mark asset, and cleans up on unmount', () => {
    const { container, unmount } = render(
      <MemoryRouter initialEntries={['/let-there-be-light']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(container.querySelector('.attend-root')).toBeInTheDocument()
    expect(container.querySelector('canvas.attend-sky')).toBeInTheDocument()
    expect(container.querySelector('canvas.attend-dust')).toBeInTheDocument()

    const introLogo = screen.getByRole('img', { name: 'Biro Psikologi Attentive' })
    expect(introLogo).toHaveAttribute('src', '/images/brand/attend-mark.png')
    expect(introLogo).toHaveAttribute('width', '88')
    expect(introLogo).toHaveAttribute('height', '88')

    const fontLink = document.getElementById('attend-ltbl-fonts') as HTMLLinkElement | null
    expect(fontLink).not.toBeNull()
    expect(fontLink?.href).toContain('Cormorant+Garamond')
    expect(fontLink?.href).toContain('Instrument+Sans')
    expect(document.title).toBe('Attend')

    unmount()
    expect(document.title).toBe('Initial Title')
    expect(document.documentElement.lang).toBe('en')
  })

  it('walks through language setup, crisis triage in waiting room, and task grading', () => {
    render(
      <MemoryRouter initialEntries={['/let-there-be-light']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('img', { name: 'Biro Psikologi Attentive' }))
    expect(screen.getByRole('heading', { name: /Bahasa · Language/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(document.documentElement.lang).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: 'In silence' }))
    expect(localStorage.getItem(STORE_KEY)).toContain('"lang":"en"')

    fireEvent.click(screen.getByRole('button', { name: 'Light it' }))
    fireEvent.click(screen.getByRole('button', { name: 'In the Attentive waiting room' }))
    fireEvent.click(screen.getByRole('button', { name: 'Before my session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Very heavy' }))

    expect(screen.getByRole('heading', { name: /May we ask you something important/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    fireEvent.click(screen.getByRole('button', { name: "I'm not sure" }))

    expect(screen.getByText('Show this screen to the front desk')).toBeInTheDocument()
    expect(screen.getByText('I need to speak with a psychologist now.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'healing119.id' })).toHaveAttribute('href', 'https://www.healing119.id')

    fireEvent.click(screen.getByRole('button', { name: "I'd like to stay here for now" }))
    fireEvent.click(screen.getByRole('button', { name: 'I doubt it' }))

    expect(screen.getByRole('heading', { name: /Place both feet flat on the floor/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Not yet' }))
    expect(screen.getByRole('heading', { name: /Just feel your back resting against the chair/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByText(/Coming here takes courage/i)).toBeInTheDocument()
  })

  it('supports #tablet-before deep-link mode without persisting to localStorage and auto-resets when idle', () => {
    vi.useFakeTimers()

    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ prefs: { lang: 'en', sound: false } }))

      render(
        <MemoryRouter initialEntries={['/let-there-be-light#tablet-before']}>
          <AppRoutes />
        </MemoryRouter>,
      )

      fireEvent.click(screen.getByRole('img', { name: 'Biro Psikologi Attentive' }))
      // Tablet mode ignores stored prefs and asks language fresh
      expect(screen.getByRole('heading', { name: /Bahasa · Language/i })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'English' }))
      fireEvent.click(screen.getByRole('button', { name: 'In silence' }))
      fireEvent.click(screen.getByRole('button', { name: 'Light it' }))

      // Skips where & session because of #tablet-before deep link
      expect(screen.getByRole('heading', { name: /How is your heart/i })).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(180000)
      })

      expect(screen.getByRole('img', { name: 'Biro Psikologi Attentive' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
