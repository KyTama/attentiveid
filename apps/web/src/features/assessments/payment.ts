export interface PaymentOption {
  key: 'single' | 'package3'
  labelId: string
  labelEn: string
  amount: number
  normal: number
}

export const formatRupiah = (amount: number): string => `Rp ${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

/**
 * The WhatsApp message that opens after "Save & Reach Us": the name, what was paid for, the result ID, and a request to
 * confirm the payment. Bahasa Indonesia is the default.
 */
export const buildPaymentWhatsAppMessage = (input: { name: string; code: string; option: PaymentOption; lang?: 'id' | 'en' }): string => {
  const price = formatRupiah(input.option.amount)
  if (input.lang === 'en') {
    return [
      'Hello Attentive, I have paid for my MHCU full report.',
      '',
      `Name: ${input.name}`,
      `Payment for: ${input.option.labelEn} (${price})`,
      `Result ID: ${input.code}`,
      '',
      'Please confirm my payment. I have uploaded the proof of transfer on the payment page. Thank you.',
    ].join('\n')
  }
  return [
    'Halo Attentive, saya sudah melakukan pembayaran untuk laporan lengkap MHCU saya.',
    '',
    `Nama: ${input.name}`,
    `Pembayaran untuk: ${input.option.labelId} (${price})`,
    `ID Hasil: ${input.code}`,
    '',
    'Mohon bantu konfirmasi pembayaran saya. Bukti transfer sudah saya unggah di halaman pembayaran. Terima kasih.',
  ].join('\n')
}

export const buildPaymentWhatsAppUrl = (input: { whatsapp: string; name: string; code: string; option: PaymentOption; lang?: 'id' | 'en' }): string =>
  `https://wa.me/${input.whatsapp}?text=${encodeURIComponent(buildPaymentWhatsAppMessage(input))}`
