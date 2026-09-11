import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../src/i18n'
import { ConsultationIntakeModal } from '../src/components/intake/ConsultationIntakeModal'
import { IntakeModalProvider, useIntakeModal } from '../src/components/intake'

function IntakeTestConsumer() {
  const { isOpen, openIntake, closeIntake } = useIntakeModal()
  return (
    <div>
      <button type="button" onClick={() => openIntake()}>
        Open Intake
      </button>
      <button
        type="button"
        onClick={() => openIntake({ concernId: 'career_burnout', psychologistId: 'syazka' })}
      >
        Open Preselected
      </button>
      <ConsultationIntakeModal isOpen={isOpen} onClose={closeIntake} />
    </div>
  )
}

describe('ConsultationIntakeModal & Flow', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
    vi.restoreAllMocks()
  })

  it('does not render anything when isOpen is false', () => {
    render(<ConsultationIntakeModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders Step 1 initially and handles close button and Escape key', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    const { rerender } = render(<ConsultationIntakeModal isOpen={true} onClose={handleClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Apa yang sedang memenuhi pikiranmu\?/i)).toBeInTheDocument()

    // Test close button
    const closeBtn = screen.getByRole('button', { name: /Tutup formulir konseling/i })
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    // Test Escape key
    rerender(<ConsultationIntakeModal isOpen={true} onClose={handleClose} />)
    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalledTimes(2)
  })

  it('progresses from Step 1 through Step 2 to Step 3 with validations', async () => {
    const user = userEvent.setup()
    render(<ConsultationIntakeModal isOpen={true} onClose={vi.fn()} />)

    // Step 1: Select concern
    const moodCard = screen.getByRole('button', { name: /Kecemasan, Overthinking & Mood/i })
    await user.click(moodCard)

    // Next button to Step 2
    const step1Next = screen.getByRole('button', { name: /Lanjut ke Detail/i })
    await user.click(step1Next)

    // Expect Step 2 form
    expect(screen.getByText(/Ceritakan sedikit tentang dirimu/i)).toBeInTheDocument()

    // Try submitting without name and whatsapp
    const step2Next = screen.getByRole('button', { name: /Lihat Rekomendasi & Cek/i })
    await user.click(step2Next)
    expect(screen.getByText(/Lengkapi nama Anda/i)).toBeInTheDocument()

    // Enter name
    const nameInput = screen.getByPlaceholderText('Nama Anda')
    await user.type(nameInput, 'Budi Santoso')

    // Try submitting with short whatsapp
    const phoneInput = screen.getByPlaceholderText(/mis\. 08123456789/i)
    await user.type(phoneInput, '0812')
    await user.click(step2Next)
    expect(screen.getByText(/Masukkan nomor WhatsApp yang valid/i)).toBeInTheDocument()

    // Enter valid whatsapp and date
    await user.clear(phoneInput)
    await user.type(phoneInput, '081234567890')

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    if (dateInput) {
      await user.type(dateInput, '2026-09-20')
    }

    // Proceed to Step 3
    await user.click(step2Next)

    // Expect Step 3
    expect(screen.getByText(/Rekomendasi Psikolog & Konfirmasi/i)).toBeInTheDocument()

    // Verify multiple curated psychologist recommendations (>1 psychologist) are shown
    const psychologistCards = screen.getAllByRole('button', { name: /M\.Psi|Psikolog|Rekomendasi Admin/i })
    expect(psychologistCards.length).toBeGreaterThan(1)

    // Verify summary values
    expect(screen.getByText(/Budi Santoso/i)).toBeInTheDocument()
    expect(screen.getByText(/081234567890/i)).toBeInTheDocument()
  })

  it('supports inline Ubah jump links in Step 3 to navigate back', async () => {
    const user = userEvent.setup()
    render(<ConsultationIntakeModal isOpen={true} onClose={vi.fn()} />)

    // Step 1 -> Step 2
    await user.click(screen.getByRole('button', { name: /Lanjut ke Detail/i }))

    // Fill Step 2
    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Dewi Lestari')
    await user.type(screen.getByPlaceholderText(/mis\. 08123456789/i), '081298765432')
    await user.click(screen.getByRole('button', { name: /Lihat Rekomendasi & Cek/i }))

    expect(screen.getByText(/Rekomendasi Psikolog & Konfirmasi/i)).toBeInTheDocument()

    // Click "Ubah" for concern to jump to Step 1
    const editButtons = screen.getAllByRole('button', { name: /Ubah/i })
    await user.click(editButtons[0]) // Jump to step 1
    expect(screen.getByText(/Apa yang sedang memenuhi pikiranmu\?/i)).toBeInTheDocument()

    // Change concern to relationship
    const relCard = screen.getByRole('button', { name: /Pasangan, Pernikahan & Relasi/i })
    await user.click(relCard)
    await user.click(screen.getByRole('button', { name: /Lanjut ke Detail/i }))

    // On Step 2, jump back to Step 3
    await user.click(screen.getByRole('button', { name: /Lihat Rekomendasi & Cek/i }))

    // Check that summary now contains relationship
    expect(screen.getByText(/Pasangan, Pernikahan & Relasi/i)).toBeInTheDocument()
  })

  it('displays crisis safeguard emergency banner when crisis keywords are detected', async () => {
    const user = userEvent.setup()
    render(<ConsultationIntakeModal isOpen={true} onClose={vi.fn()} />)

    // Step 1
    await user.click(screen.getByRole('button', { name: /Lanjut ke Detail/i }))

    // Step 2 with crisis keyword
    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Clara')
    await user.type(screen.getByPlaceholderText(/mis\. 08123456789/i), '081211112222')
    await user.type(
      screen.getByPlaceholderText(/Ceritakan apa yang membuatmu mencari bantuan/i),
      'Saya merasa sangat hampa dan ada dorongan untuk bunuh diri'
    )

    await user.click(screen.getByRole('button', { name: /Lihat Rekomendasi & Cek/i }))

    // Verify Crisis banner is present with hotlines
    expect(screen.getByText(/Bantuan Darurat & Krisis/i)).toBeInTheDocument()
    expect(screen.getByText(/119 ext 8/i)).toBeInTheDocument()
    expect(screen.getByText(/Into The Light/i)).toBeInTheDocument()
  })

  it('validates consent and opens formatted WhatsApp URL on submit', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ConsultationIntakeModal isOpen={true} onClose={vi.fn()} />)

    // Advance to Step 3
    await user.click(screen.getByRole('button', { name: /Lanjut ke Detail/i }))
    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Rian Ardianto')
    await user.type(screen.getByPlaceholderText(/mis\. 08123456789/i), '081377778888')
    await user.click(screen.getByRole('button', { name: /Lihat Rekomendasi & Cek/i }))

    // Try submitting without consent
    const submitBtn = screen.getByRole('button', { name: /Kirim ke WhatsApp Admin/i })
    await user.click(submitBtn)
    expect(screen.getByText(/Mohon centang persetujuan etika kerahasiaan/i)).toBeInTheDocument()
    expect(openSpy).not.toHaveBeenCalled()

    // Check consent checkbox
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Submit now
    await user.click(submitBtn)
    expect(openSpy).toHaveBeenCalledTimes(1)
    const openedUrl = openSpy.mock.calls[0][0] as string

    expect(openedUrl).toContain('https://wa.me/6285156410912')
    expect(openedUrl).toContain(encodeURIComponent('Rian Ardianto'))
    expect(openedUrl).toContain(encodeURIComponent('081377778888'))
  })

  it('works seamlessly through IntakeModalProvider and triggers with options', async () => {
    const user = userEvent.setup()
    render(
      <IntakeModalProvider>
        <IntakeTestConsumer />
      </IntakeModalProvider>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Open via trigger
    await user.click(screen.getByRole('button', { name: 'Open Intake' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close
    await user.click(screen.getByRole('button', { name: /Tutup formulir konseling/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
