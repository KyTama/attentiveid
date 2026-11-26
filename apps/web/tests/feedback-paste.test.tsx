import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { FeedbackPage } from '@/pages/FeedbackPage'

afterEach(cleanup)

describe('pasting attachments on /feedback', () => {
  it('adds pasted screenshots as separate files that can be removed, and leaves pasted text alone', () => {
    render(
      <MemoryRouter>
        <FeedbackPage />
      </MemoryRouter>,
    )
    const form = screen.getByRole('textbox', { name: /Ceritakan|What happened/ }).closest('form') as HTMLFormElement
    const shot = () => new File(['x'], 'image.png', { type: 'image/png' })

    fireEvent.paste(form, { clipboardData: { files: [] } })
    expect(screen.queryByRole('list', { name: /Berkas terlampir|Attached files/ })).toBeNull()

    fireEvent.paste(form, { clipboardData: { files: [shot()] } })
    fireEvent.paste(form, { clipboardData: { files: [shot()] } })
    const removes = screen.getAllByRole('button', { name: /(Hapus|Remove) paste-/ })
    expect(removes).toHaveLength(2)

    fireEvent.click(removes[0]!)
    expect(screen.getAllByRole('button', { name: /(Hapus|Remove) paste-/ })).toHaveLength(1)
  })
})
