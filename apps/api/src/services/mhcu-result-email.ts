/**
 * The e-mail a participant gets after the Mental Health Check-Up: the four index scores with their category, a short
 * explanation, and an optional way to order the full analysed report. It never shows the clinical level or the red-flag reasons:
 * those are for the psychologist.
 *
 * Built to look like a calm, trustworthy message and not like a sales or phishing mail: results first, safety information before
 * any offer, no long tracking-style link in the text, a clear reason why the person is receiving it, and a plain footer.
 */

export interface MhcuEmailInput {
    name: string
    code: string
    lang: 'id' | 'en'
    /** The stored scoring result (see scoreMhcu); read defensively. */
    scores: unknown
    /** Link to the payment page (already carries the signed token). */
    reportLink: string
    level: number | null
    /** When the check-up was submitted; shown so the person recognises the mail as theirs. */
    submittedAt?: Date
    /** The address the mail goes to, repeated in the footer so the person sees why they got it. */
    email?: string
}

export interface BuiltEmail {
    subject: string
    html: string
    text: string
}

const esc = (value: unknown): string =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {})
const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const label = (value: unknown, lang: 'id' | 'en'): string => {
    const record = asRecord(value)
    const text = record[lang]
    return typeof text === 'string' && text ? text : '–'
}
const fmt = (value: number | null, lang: 'id' | 'en'): string => {
    if (value === null) return '–'
    const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, '')
    return lang === 'id' ? text.replace('.', ',') : text
}

const MONTHS = {
    id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
} as const

/** "22 November 2026, 10.49 WIB" (Jakarta time). */
export const formatSubmittedAt = (date: Date, lang: 'id' | 'en'): string => {
    const jakarta = new Date(date.getTime() + 7 * 3600 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${jakarta.getUTCDate()} ${MONTHS[lang][jakarta.getUTCMonth()]} ${jakarta.getUTCFullYear()}, ${pad(jakarta.getUTCHours())}.${pad(jakarta.getUTCMinutes())} WIB`
}

export interface EmailSection {
    key: 'di' | 'wi' | 'bhi' | 'ati'
    title: string
    score: string
    category: string
    note: string
}

/** The four sections shown at the top of the e-mail. */
export const mhcuEmailSections = (scores: unknown, lang: 'id' | 'en'): EmailSection[] => {
    const s = asRecord(scores)
    const ati = asRecord(s.ati)
    const atiIndex = num(ati.index)
    const atiTotal = num(ati.total)
    const id = lang === 'id'
    return [
        {
            key: 'di',
            title: id ? 'Distress Index (DI) · Tingkat keluhan' : 'Distress Index (DI) · Symptom load',
            score: `${fmt(num(s.di), lang)} / 100`,
            category: label(s.diCategory, lang),
            note: id ? 'Makin rendah makin baik.' : 'Lower is better.'
        },
        {
            key: 'wi',
            title: id ? 'Well-being Index (WI) · Kesejahteraan' : 'Well-being Index (WI) · Well-being',
            score: `${fmt(num(s.wi), lang)} / 100`,
            category: label(s.wiCategory, lang),
            note: id ? 'Makin tinggi makin baik.' : 'Higher is better.'
        },
        {
            key: 'bhi',
            title: id ? 'Behavioral Health Index (BHI) · Kebiasaan sehat' : 'Behavioral Health Index (BHI) · Healthy habits',
            score: `${fmt(num(s.bhi), lang)} / 100`,
            category: label(s.bhiCategory, lang),
            note: id ? 'Makin tinggi makin baik.' : 'Higher is better.'
        },
        {
            key: 'ati',
            title: id ? 'Attentive Personality Index (ATI) · Gaya perhatian' : 'Attentive Personality Index (ATI) · Attention style',
            score: atiIndex === null ? '–' : `${fmt(atiIndex, lang)} / 100${atiTotal === null ? '' : ` (${fmt(atiTotal, lang)} / 24)`}`,
            category: label(ati.category, lang),
            note: id ? 'Gambaran gaya Anda, bukan nilai baik atau buruk.' : 'A picture of your style, not a good or bad mark.'
        }
    ]
}

const COPY = {
    id: {
        subject: (code: string) => `Hasil Mental Health Check-Up (MHCU) Anda · ${code}`,
        preheader: 'Ringkasan hasil Mental Health Check-Up Anda dari Attentive Psychology Bureau.',
        hello: (name: string) => `Halo ${name},`,
        intro: (when: string) =>
            `Terima kasih telah mengisi Mental Health Check-Up (MHCU) dari Attentive Psychology Bureau pada ${when}. Berikut ringkasan hasil Anda.`,
        overall: 'Mental Health Index (MHI) keseluruhan',
        resultId: 'ID Hasil',
        about:
            'Ini adalah hasil skrining, bukan diagnosis. Skor menggambarkan keadaan Anda dalam 2 minggu terakhir (kebiasaan dan gaya perhatian: secara umum). Psikolog Attentive dapat membantu menjelaskan hasil ini bila Anda membutuhkannya.',
        safetyHead: 'Bila Anda merasa tidak aman',
        safety:
            'Bila Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, jangan menunggu hasil lanjutan: hubungi orang terdekat yang Anda percaya, layanan darurat medis 119, atau IGD rumah sakit terdekat.',
        nextHead: 'Langkah berikutnya (opsional)',
        nextBody:
            'Bila Anda ingin penjelasan yang lebih lengkap, tersedia laporan lengkap yang dianalisis psikolog Attentive: analisis per domain, keterangan, dan rekomendasi. Laporan ini berbayar (transfer bank, rincian ada di halaman berikutnya) dan sepenuhnya pilihan Anda.',
        button: 'Dapatkan Laporan Lengkap Anda di Sini!',
        noButton: 'Tombol tidak berfungsi? Balas email ini atau hubungi kami lewat WhatsApp, sebutkan ID Hasil di atas.',
        why: (email: string) =>
            `Anda menerima email ini karena alamat ${email} digunakan untuk mengisi MHCU di attentiveid.com. Bila ini bukan Anda, abaikan email ini.`,
        trust: 'Attentive tidak pernah meminta kata sandi, kode OTP, atau data kartu lewat email.',
        footer: 'Attentive Psychology Bureau · attentiveid.com · contact@attentiveid.com · WhatsApp 0851-5641-0912'
    },
    en: {
        subject: (code: string) => `Your Mental Health Check-Up (MHCU) result · ${code}`,
        preheader: 'A summary of your Mental Health Check-Up from Attentive Psychology Bureau.',
        hello: (name: string) => `Hello ${name},`,
        intro: (when: string) =>
            `Thank you for completing the Mental Health Check-Up (MHCU) by Attentive Psychology Bureau on ${when}. Here is a summary of your result.`,
        overall: 'Overall Mental Health Index (MHI)',
        resultId: 'Result ID',
        about:
            'This is a screening result, not a diagnosis. The scores describe how you were over the past 2 weeks (habits and attention style: in general). An Attentive psychologist can help explain this result if you would like.',
        safetyHead: 'If you feel unsafe',
        safety:
            'If you are having thoughts of harming yourself or feel unsafe, please do not wait for any further result: reach out to someone you trust, call the medical emergency line 119, or go to the nearest hospital emergency room.',
        nextHead: 'Next step (optional)',
        nextBody:
            'If you would like a fuller explanation, a full report analysed by an Attentive psychologist is available: an analysis of every domain, notes and recommendations. It is a paid service (bank transfer, details on the next page) and entirely your choice.',
        button: 'Get Your Full Analyzed Report Here!',
        noButton: 'Button not working? Reply to this e-mail or message us on WhatsApp and mention the Result ID above.',
        why: (email: string) =>
            `You are receiving this e-mail because ${email} was used to complete the MHCU at attentiveid.com. If this was not you, please ignore this e-mail.`,
        trust: 'Attentive never asks for passwords, OTP codes or card details by e-mail.',
        footer: 'Attentive Psychology Bureau · attentiveid.com · contact@attentiveid.com · WhatsApp +62 851-5641-0912'
    }
} as const

export const buildMhcuResultEmail = (input: MhcuEmailInput): BuiltEmail => {
    const lang = input.lang === 'en' ? 'en' : 'id'
    const copy = COPY[lang]
    const sections = mhcuEmailSections(input.scores, lang)
    const s = asRecord(input.scores)
    const mhi = `${fmt(num(s.mhi), lang)} / 100`
    const mhiBand = label(s.mhiBand, lang)
    const showSafety = input.level !== null && input.level >= 3
    const when = formatSubmittedAt(input.submittedAt ?? new Date(), lang)
    const emailAddress = input.email ?? ''

    const rows = sections
        .map(
            (section) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top">
          <div style="font-weight:600;color:#111827;font-size:14px">${esc(section.title)}</div>
          <div style="color:#6b7280;font-size:12px;margin-top:2px">${esc(section.note)}</div>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:right;vertical-align:top;width:34%;min-width:84px">
          <div style="font-weight:700;color:#111827;font-size:16px">${esc(section.score)}</div>
          <div style="margin-top:3px;color:#374151;font-size:12px">${esc(section.category)}</div>
        </td>
      </tr>`
        )
        .join('')

    const safetyBlock = showSafety
        ? `
      <div style="margin:20px 0 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
        <div style="font-weight:600;color:#111827;font-size:14px">${esc(copy.safetyHead)}</div>
        <p style="margin:6px 0 0;font-size:13px;line-height:1.6;color:#374151">${esc(copy.safety)}</p>
      </div>`
        : ''

    const html = `<!doctype html>
<html lang="${lang}"><body style="margin:0;background:#f3f4f6;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#111827">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(copy.preheader)}</div>
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#142B51;border-radius:10px 10px 0 0;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:700">attentive. <span style="color:#d19e3a;font-size:11px;letter-spacing:1.5px;margin-left:8px">PSYCHOLOGY BUREAU</span></div>
    <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px">
      <p style="margin:0 0 8px;font-size:16px;font-weight:600">${esc(copy.hello(input.name))}</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#374151">${esc(copy.intro(when))}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;overflow:hidden">${rows}
        <tr>
          <td style="padding:14px 16px;background:#f3f4f6;font-weight:600;color:#111827;font-size:14px">${esc(copy.overall)}</td>
          <td style="padding:14px 16px;background:#f3f4f6;text-align:right;font-weight:700;color:#111827">${esc(mhi)} · ${esc(mhiBand)}</td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7280">${esc(copy.resultId)}: <b style="color:#111827">${esc(input.code)}</b></p>
      <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#374151">${esc(copy.about)}</p>
      ${safetyBlock}
      <div style="margin:22px 0 0;padding-top:18px;border-top:1px solid #e5e7eb">
        <div style="font-weight:600;color:#111827;font-size:14px">${esc(copy.nextHead)}</div>
        <p style="margin:6px 0 14px;font-size:13px;line-height:1.6;color:#374151">${esc(copy.nextBody)}</p>
        <a href="${esc(input.reportLink)}" style="display:inline-block;background:#142B51;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:6px">${esc(copy.button)}</a>
        <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6b7280">${esc(copy.noButton)}</p>
      </div>
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:11px;line-height:1.6;color:#6b7280">${emailAddress ? `${esc(copy.why(emailAddress))}<br>` : ''}${esc(copy.trust)}<br>${esc(copy.footer)}</p>
  </div>
</body></html>`

    const text = [
        copy.hello(input.name),
        '',
        copy.intro(when),
        '',
        ...sections.map((section) => `${section.title}: ${section.score} (${section.category})`),
        `${copy.overall}: ${mhi} (${mhiBand})`,
        `${copy.resultId}: ${input.code}`,
        '',
        copy.about,
        ...(showSafety ? ['', `${copy.safetyHead}: ${copy.safety}`] : []),
        '',
        copy.nextHead,
        copy.nextBody,
        copy.button,
        input.reportLink,
        '',
        ...(emailAddress ? [copy.why(emailAddress)] : []),
        copy.trust,
        copy.footer
    ].join('\n')

    return { subject: copy.subject(input.code), html, text }
}
