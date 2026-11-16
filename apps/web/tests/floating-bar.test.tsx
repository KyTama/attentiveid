import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FLOATING_BAR, type FloatingBarSettings } from '@attentiveid/shared'
import { FloatingBarView } from '@/components/landing/FloatingBarView'

describe('FloatingBarView', () => {
  it('shows the lights logo on top and the three default buttons, in English', () => {
    render(<FloatingBarView isId={false} settings={DEFAULT_FLOATING_BAR} />)
    const logo = screen.getByRole('link', { name: 'Attend' })
    expect(logo).toHaveAttribute('href', '/let-there-be-light')
    expect(screen.getByRole('link', { name: '1st Free Session' })).toHaveAttribute('href', 'https://free-session.attentiveid.com')
    expect(screen.getByRole('link', { name: 'Direct Booking' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Free Personality Test' })).toHaveAttribute('href', 'https://big10.attentiveid.com/')
  })

  it('uses Indonesian text, hides hidden buttons, and can show a text link with an icon on top', () => {
    const settings: FloatingBarSettings = {
      ...DEFAULT_FLOATING_BAR,
      top: { ...DEFAULT_FLOATING_BAR.top, mode: 'link', label: { id: 'Coba Attend', en: 'Try Attend' }, icon: 'sun' },
      items: DEFAULT_FLOATING_BAR.items.map((item, index) => ({ ...item, visible: index !== 1 })),
    }
    render(<FloatingBarView isId settings={settings} />)
    expect(screen.getByRole('link', { name: 'Coba Attend' })).toHaveTextContent('Coba Attend')
    expect(screen.getByRole('link', { name: 'Sesi Gratis Pertama' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Booking Langsung' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tes Kepribadian Gratis' })).toBeInTheDocument()
  })

  it('does nothing in the portal preview (no links) and offers a close button when asked', () => {
    render(<FloatingBarView dismissLabel="Close quick bar" isId={false} onDismiss={() => undefined} preview settings={DEFAULT_FLOATING_BAR} />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Close quick bar' })).toBeInTheDocument()
  })
})
