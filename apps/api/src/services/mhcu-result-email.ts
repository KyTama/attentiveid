/**
 * The e-mail a participant gets after the Mental Health Check-Up: the four index scores with their category, a short
 * explanation, and a button to order the full analysed report. It never shows the clinical level or the red-flag reasons:
 * those are for the psychologist.
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
        hello: (name: string) => `Halo ${name},`,
        intro: 'Terima kasih telah mengisi Mental Health Check-Up (MHCU) dari Attentive Psychology Bureau. Berikut ringkasan hasil Anda.',
        overall: 'Mental Health Index (MHI) keseluruhan',
        resultId: 'ID Hasil',
        about:
            'Ini adalah hasil skrining, bukan diagnosis. Skor menggambarkan keadaan Anda dalam 2 minggu terakhir (kebiasaan dan gaya perhatian: secara umum).',
        reportHead: 'Ingin penjelasan yang lengkap?',
        reportBody:
            'Laporan lengkap berisi analisis per domain, keterangan, dan rekomendasi dari psikolog Attentive. Pembelian bersifat opsional.',
        button: 'Dapatkan Laporan Lengkap Anda di Sini!',
        buttonHelp: 'Bila tombol tidak berfungsi, salin tautan ini ke peramban Anda:',
        safety:
            'Bila Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, jangan menunggu: hubungi orang terdekat yang Anda percaya, layanan darurat medis 119, atau IGD rumah sakit terdekat.',
        footer: 'Attentive Psychology Bureau · contact@attentiveid.com · WhatsApp 0851-5641-0912'
    },
    en: {
        subject: (code: string) => `Your Mental Health Check-Up (MHCU) result · ${code}`,
        hello: (name: string) => `Hello ${name},`,
        intro: 'Thank you for completing the Mental Health Check-Up (MHCU) by Attentive Psychology Bureau. Here is a summary of your result.',
        overall: 'Overall Mental Health Index (MHI)',
        resultId: 'Result ID',
        about:
            'This is a screening result, not a diagnosis. The scores describe how you were over the past 2 weeks (habits and attention style: in general).',
        reportHead: 'Want the full explanation?',
        reportBody:
            'The full report has an analysis of every domain, notes and recommendations from an Attentive psychologist. Buying it is optional.',
        button: 'Get Your Full Analyzed Report Here!',
        buttonHelp: 'If the button does not work, copy this link into your browser:',
        safety:
            'If you are having thoughts of harming yourself or feel unsafe, please do not wait: reach out to someone you trust, call the medical emergency line 119, or go to the nearest hospital emergency room.',
        footer: 'Attentive Psychology Bureau · contact@attentiveid.com · WhatsApp +62 851-5641-0912'
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

    const rows = sections
        .map(
            (section) => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid #e6e9ef;vertical-align:top">
          <div style="font-weight:700;color:#142B51;font-size:14px">${esc(section.title)}</div>
          <div style="color:#6B7686;font-size:12px;margin-top:2px">${esc(section.note)}</div>
        </td>
        <td style="padding:12px 14px;border-bottom:1px solid #e6e9ef;text-align:right;white-space:nowrap;vertical-align:top">
          <div style="font-weight:700;color:#142B51;font-size:16px">${esc(section.score)}</div>
          <div style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;background:#FBF5E8;color:#8a5f10;font-size:12px;font-weight:700">${esc(section.category)}</div>
        </td>
      </tr>`
        )
        .join('')

    const html = `<!doctype html>
<html lang="${lang}"><body style="margin:0;background:#f3f5f8;font-family:Segoe UI,Arial,sans-serif;color:#1B2533">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#142B51;border-radius:12px 12px 0 0;padding:18px 24px;color:#fff;font-size:18px;font-weight:700">attentive. <span style="color:#D19E3A;font-size:11px;letter-spacing:1.5px;margin-left:8px">MHCU</span></div>
    <div style="background:#fff;padding:24px;border:1px solid #e6e9ef;border-top:0">
      <p style="margin:0 0 8px;font-size:16px;font-weight:700">${esc(copy.hello(input.name))}</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">${esc(copy.intro)}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e6e9ef;border-radius:10px;border-collapse:separate;overflow:hidden">${rows}
        <tr>
          <td style="padding:12px 14px;background:#EEF2F8;font-weight:700;color:#142B51;font-size:14px">${esc(copy.overall)}</td>
          <td style="padding:12px 14px;background:#EEF2F8;text-align:right;font-weight:700;color:#142B51;white-space:nowrap">${esc(mhi)} · ${esc(mhiBand)}</td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#6B7686">${esc(copy.resultId)}: <b>${esc(input.code)}</b></p>
      <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#3C4858">${esc(copy.about)}</p>
      <div style="margin:22px 0 0;padding:18px;border:1px solid #D19E3A;border-radius:10px;background:#FBF5E8;text-align:center">
        <div style="font-weight:700;color:#142B51;font-size:15px">${esc(copy.reportHead)}</div>
        <p style="margin:6px 0 14px;font-size:13px;line-height:1.6;color:#3C4858">${esc(copy.reportBody)}</p>
        <a href="${esc(input.reportLink)}" style="display:inline-block;background:#142B51;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:8px">${esc(copy.button)}</a>
        <p style="margin:12px 0 0;font-size:11px;color:#6B7686">${esc(copy.buttonHelp)}<br><span style="word-break:break-all">${esc(input.reportLink)}</span></p>
      </div>
      ${showSafety ? `<p style="margin:18px 0 0;padding:12px 14px;border-radius:8px;background:#FEF3F2;color:#B42318;font-size:13px;line-height:1.6">${esc(copy.safety)}</p>` : ''}
    </div>
    <p style="margin:14px 0 0;text-align:center;font-size:11px;color:#6B7686">${esc(copy.footer)}</p>
  </div>
</body></html>`

    const text = [
        copy.hello(input.name),
        '',
        copy.intro,
        '',
        ...sections.map((section) => `${section.title}: ${section.score} (${section.category})`),
        `${copy.overall}: ${mhi} (${mhiBand})`,
        `${copy.resultId}: ${input.code}`,
        '',
        copy.about,
        '',
        `${copy.button}`,
        input.reportLink,
        ...(showSafety ? ['', copy.safety] : []),
        '',
        copy.footer
    ].join('\n')

    return { subject: copy.subject(input.code), html, text }
}
