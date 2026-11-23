/**
 * The result e-mail a participant gets after the Mental Health Check-Up. It follows the team's e-mail template
 * (RMHCU/new, documents "Pemeriksaan mandiri" and "Pemeriksaan mandiri, Level 4"): the Mental Health Index and the overall
 * status level only. The three indices (DI, WI, BHI) are part of the full report, not of this e-mail, and the clinical
 * red-flag reasons are for the psychologist only.
 */

import { PAYMENT_OPTIONS, PROMO_UNTIL, priceFor } from './assessment-payment'

export interface MhcuEmailInput {
    name: string
    code: string
    lang: 'id' | 'en'
    /** The stored scoring result (see scoreMhcu); read defensively. */
    scores: unknown
    /** Link to the unlock/payment page (already carries the signed token). */
    reportLink: string
    /** 1-5; null when the result is incomplete. */
    level: number | null
    /** When the check-up was submitted. */
    submittedAt?: Date
    /** Public address of the site, used for the logo (images must be hosted: mail clients do not show embedded ones). */
    siteOrigin?: string
    today?: Date
}

export interface BuiltEmail {
    subject: string
    html: string
    text: string
}

const esc = (value: unknown): string =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const record = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {})

const MONTHS = {
    id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
} as const

/** "19 November 2026" (Jakarta date). */
export const formatSubmittedDate = (date: Date, lang: 'id' | 'en'): string => {
    const jakarta = new Date(date.getTime() + 7 * 3600 * 1000)
    return `${jakarta.getUTCDate()} ${MONTHS[lang][jakarta.getUTCMonth()]} ${jakarta.getUTCFullYear()}`
}

const decimal = (value: number, lang: 'id' | 'en'): string => {
    const text = (Math.round(value * 10) / 10).toFixed(1)
    return lang === 'id' ? text.replace('.', ',') : text
}

const rupiah = (amount: number): string => `Rp ${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

const LEVELS = {
    id: ['Baik', 'Perlu Dipantau', 'Perlu Perhatian', 'Perlu Perhatian Serius', 'Prioritas'],
    en: ['Good', 'Needs Monitoring', 'Needs Attention', 'Needs Serious Attention', 'Priority']
} as const
/** The colour strip under the status scale (from the template). */
const LEVEL_COLORS = ['#8DB39B', '#B9C98F', '#D9C089', '#D3A184', '#C48A8A'] as const
/** The reference bar: lowest band first (0-40, 40-55, 55-70, 70-100) with its share of the width. */
const BAR = [
    { idx: 3, width: 40, bg: '#D0D5DD', from: 0 },
    { idx: 2, width: 15, bg: '#DDE1E7', from: 40 },
    { idx: 1, width: 15, bg: '#E8EBEF', from: 55 },
    { idx: 0, width: 30, bg: '#F4F5F7', from: 70 }
] as const

const COPY = {
    id: {
        subject: (code: string) => `Hasil Mental Health Check-Up (MHCU) Anda · ${code}`,
        kicker: 'MENTAL HEALTH CHECK-UP',
        summary: 'RINGKASAN HASIL',
        heading: 'Hasil Mental Health Check-Up Anda',
        greeting: (name: string, date: string) =>
            `Yth. ${name}, terima kasih telah mengikuti Mental Health Check-Up pada ${date}. Berikut ringkasan hasil Anda.`,
        noticeBold: 'Psikolog Attentive akan segera menghubungi Anda.',
        noticeRest:
            ' Bila Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, segera hubungi layanan darurat medis 119 atau datang ke IGD terdekat.',
        mhi: 'MENTAL HEALTH INDEX',
        outOf: 'dari 100 (semakin tinggi semakin baik)',
        status: 'STATUS KESELURUHAN',
        levelOf: (level: number, name: string) => `Level ${level} dari 5: ${name}`,
        scale: 'SKALA STATUS',
        position: 'POSISI MHI PADA RENTANG RUJUKAN',
        whatHead: 'Apa yang diukur MHI?',
        whatBody:
            'Mental Health Index (MHI) adalah angka 0 sampai 100 yang merangkum kondisi kesehatan mental Anda dalam 2 minggu terakhir. Semakin tinggi angkanya, semakin baik. MHI dihitung dari tiga indeks berikut.',
        whatList: [
            'Distress Index (DI) menunjukkan seberapa banyak keluhan dan tekanan psikologis yang Anda alami.',
            'Well-being Index (WI) menunjukkan sisi positif kesehatan mental, misalnya perasaan, keberfungsian, dan hubungan dengan orang lain.',
            'Behavioral Health Index (BHI) menunjukkan kebiasaan sehari-hari yang mendukung kesehatan mental.'
        ],
        reportTitle: (code: string) => `Laporan lengkap ${code}`,
        reportDesc: 'Hasil per indeks (DI, WI, BHI) beserta keterangan dan rekomendasi dari psikolog.',
        teaserHead: 'CONTOH LAPORAN (PDF)',
        teaserSingle: 'Contoh laporan 1x pemeriksaan',
        teaserPackage: 'Contoh laporan paket 3x (perkembangan dari waktu ke waktu)',
        teaserOpen: 'Buka contoh',
        single: 'Laporan 1x',
        bundle: 'Paket 3x pemeriksaan',
        promoUntil: (date: string) => `Harga promo berlaku hingga ${date}.`,
        afterBuy: 'Setelah pembelian, psikolog Attentive akan ditugaskan untuk meninjau hasil Anda dan menyusun laporan lengkap.',
        button: 'Beli laporan lengkap',
        confirmed: 'Pembayaran dikonfirmasi oleh admin kami.',
        disclaimer: 'Hasil ini merupakan skrining berbasis laporan diri, bukan diagnosis klinis. ',
        disclaimerSafety:
            'Bila Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, segera hubungi layanan darurat medis 119 atau datang ke IGD terdekat.',
        org: 'Biro Psikologi Attentive',
        confidential: 'Email ini bersifat rahasia dan hanya ditujukan kepada penerima.'
    },
    en: {
        subject: (code: string) => `Your Mental Health Check-Up (MHCU) result · ${code}`,
        kicker: 'MENTAL HEALTH CHECK-UP',
        summary: 'RESULT SUMMARY',
        heading: 'Your Mental Health Check-Up Result',
        greeting: (name: string, date: string) =>
            `Dear ${name}, thank you for taking the Mental Health Check-Up on ${date}. Here is a summary of your result.`,
        noticeBold: 'An Attentive psychologist will contact you shortly.',
        noticeRest:
            ' If you are having thoughts of harming yourself or feel unsafe, contact the medical emergency line 119 or go to the nearest emergency room right away.',
        mhi: 'MENTAL HEALTH INDEX',
        outOf: 'out of 100 (higher is better)',
        status: 'OVERALL STATUS',
        levelOf: (level: number, name: string) => `Level ${level} of 5: ${name}`,
        scale: 'STATUS SCALE',
        position: 'MHI POSITION ON THE REFERENCE RANGE',
        whatHead: 'What does the MHI measure?',
        whatBody:
            'The Mental Health Index (MHI) is a number from 0 to 100 that summarises your mental health over the past 2 weeks. The higher the number, the better. The MHI is calculated from the three indices below.',
        whatList: [
            'The Distress Index (DI) shows how many complaints and how much psychological distress you experienced.',
            'The Well-being Index (WI) shows the positive side of mental health, for example feelings, functioning and relationships with others.',
            'The Behavioral Health Index (BHI) shows the daily habits that support mental health.'
        ],
        reportTitle: (code: string) => `Full report ${code}`,
        reportDesc: 'Results per index with notes and recommendations from a psychologist.',
        teaserHead: 'SAMPLE REPORTS (PDF)',
        teaserSingle: 'Sample: a single check-up report',
        teaserPackage: 'Sample: package of 3 (progress over time)',
        teaserOpen: 'Open the sample',
        single: 'Single report',
        bundle: 'Package of 3 check-ups',
        promoUntil: (date: string) => `Introductory prices are valid until ${date}.`,
        afterBuy: 'After purchase, an Attentive psychologist will be assigned to review your result and prepare the full report.',
        button: 'Buy the full report',
        confirmed: 'Payment is confirmed by our admin.',
        disclaimer: 'This result is a self-report screening, not a clinical diagnosis. ',
        disclaimerSafety:
            'If you are having thoughts of harming yourself or feel unsafe, contact the medical emergency line 119 or go to the nearest emergency room right away.',
        org: 'Attentive Psychology Bureau',
        confidential: 'This e-mail is confidential and intended only for the recipient.'
    }
} as const

const FONT = 'Montserrat,Arial,Helvetica,sans-serif'

export const buildMhcuResultEmail = (input: MhcuEmailInput): BuiltEmail => {
    const lang = input.lang === 'en' ? 'en' : 'id'
    const copy = COPY[lang]
    const scores = record(input.scores)
    const mhiValue = num(scores.mhi)
    const level = Math.min(5, Math.max(1, Math.round(input.level ?? num(scores.level) ?? 1)))
    const levelName = LEVELS[lang][level - 1]
    const mhiText = mhiValue === null ? '–' : decimal(mhiValue, lang)
    const date = formatSubmittedDate(input.submittedAt ?? new Date(), lang)
    const origin = (input.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '')
    const logo = `${origin}/images/assessments/attentive-logo-light.png`
    const showNotice = level >= 4

    const today = input.today ?? new Date()
    const promoActive = priceFor('single', today) < PAYMENT_OPTIONS.single.normal
    const promoDateText = formatSubmittedDate(new Date(`${PROMO_UNTIL}T12:00:00+07:00`), lang)
    const singleNow = priceFor('single', today)
    const bundleNow = priceFor('package3', today)
    const priceRow = (label: string, now: number, normal: number) =>
        `<tr><td style="padding:2px 14px 2px 0">${esc(label)}</td><td style="padding:2px 0"><span style="font-size:14px;font-weight:bold;color:#142B51">${esc(rupiah(now))}</span>${
            promoActive ? `<s style="color:#98A2B3;font-size:12px"> ${esc(rupiah(normal))}</s>` : ''
        }</td></tr>`

    const tile = (file: string, thumb: string, caption: string, pad: string) =>
        `<td width="50%" valign="top" style="padding:${pad}"><a href="${esc(`${origin}/assessments-static/${file}`)}" style="text-decoration:none;color:#142B51"><img src="${esc(`${origin}/images/email/${thumb}`)}" width="240" alt="${esc(caption)}" style="display:block;width:100%;max-width:240px;height:auto;border:1px solid #D0D5DD"><div style="font-size:11.5px;line-height:1.4;font-weight:bold;color:#1B2533;margin-top:5px">${esc(caption)}</div><div style="font-size:11px;color:#142B51;text-decoration:underline">${copy.teaserOpen}</div></a></td>`
    const teasers = tile('contoh-laporan-1x.pdf', 'teaser-1x.png', copy.teaserSingle, '0 5px 0 0') + tile('contoh-laporan-paket-3x.pdf', 'teaser-paket-3x.png', copy.teaserPackage, '0 0 0 5px')

    const scaleCells = LEVELS[lang]
        .map((name, i) => {
            const on = i + 1 === level
            return `<td width="20%" align="center" bgcolor="${on ? '#142B51' : '#F4F5F7'}" style="background:${on ? '#142B51' : '#F4F5F7'};padding:8px 2px;font-size:10.5px;line-height:1.3;color:${on ? '#FFFFFF' : '#98A2B3'};${on ? 'font-weight:bold;' : ''}border-right:2px solid #FFFFFF">${i + 1}<br>${esc(name)}</td>`
        })
        .join('')
    const scaleStrip = LEVEL_COLORS.map((color) => `<td height="3" bgcolor="${color}" style="background:${color};font-size:1px;line-height:3px;border-right:2px solid #FFFFFF">&nbsp;</td>`).join('')

    const markerLeft = mhiValue === null ? 0 : Math.min(94, Math.max(0, Math.round(mhiValue - 3)))
    const marker = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="${markerLeft}%" style="font-size:1px">&nbsp;</td><td width="6%" align="center" style="font-family:${FONT};font-size:10px;line-height:12px;font-weight:bold;color:#142B51">${esc(mhiText)}<br>&#9660;</td><td style="font-size:1px">&nbsp;</td></tr></table>`
    const bar = BAR.map(
        (band) =>
            `<td width="${band.width}%" align="center" bgcolor="${band.bg}" style="background:${band.bg};font-family:${FONT};font-size:10px;font-weight:bold;color:#3C4858;padding:6px 1px;border-right:1px solid #FFFFFF">${esc(LEVELS[lang][band.idx])}</td>`
    ).join('')

    const html = `<!DOCTYPE html><meta charset="utf-8"><div style="background:#EEF0F3;padding:24px 10px;font-family:${FONT};"><table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #D0D5DD"><tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:22px 28px 16px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle"><img src="${esc(logo)}" width="132" height="36" alt="attentive." style="display:block;border:0"></td><td align="right" valign="middle" style="font-family:${FONT};font-size:9.5px;line-height:1.6;letter-spacing:1.4px;font-weight:bold;color:#667085">${copy.kicker}</td></tr></table></td></tr><tr><td height="2" bgcolor="#142B51" style="background:#142B51;font-size:1px;line-height:2px">&nbsp;</td></tr><tr><td style="padding:26px 28px 10px 28px;font-size:14px;line-height:1.6;color:#1B2533"><p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">${copy.summary} | ${esc(input.code)}</p><p style="margin:0 0 6px 0;font-size:20px;line-height:1.3;font-weight:bold;color:#142B51">${copy.heading}</p><p style="margin:0 0 18px 0;color:#3C4858">${esc(copy.greeting(input.name, date))}</p>${
        showNotice
            ? `<div style="border:1px solid #D0D5DD;border-left:3px solid #142B51;background:#F4F5F7;padding:11px 14px;margin:0 0 18px 0;font-size:13px;color:#1B2533"><b>${copy.noticeBold}</b>${copy.noticeRest}</div>`
            : ''
    }<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT};border:1px solid #D0D5DD"><tr><td width="150" valign="middle" align="center" bgcolor="#F4F5F7" style="background:#F4F5F7;padding:16px 8px;border-right:1px solid #D0D5DD"><div style="font-size:9.5px;letter-spacing:1.4px;font-weight:bold;color:#667085">${copy.mhi}</div><div style="font-size:38px;line-height:44px;font-weight:bold;color:#142B51">${esc(mhiText)}</div><div style="font-size:10.5px;color:#667085">${copy.outOf}</div></td><td valign="middle" style="padding:14px 18px"><div style="font-size:9.5px;letter-spacing:1.4px;font-weight:bold;color:#667085">${copy.status}</div><div style="font-size:19px;line-height:25px;font-weight:bold;color:#142B51;margin-top:2px">${esc(copy.levelOf(level, levelName))}</div></td></tr></table><div style="font-family:${FONT};font-size:10px;font-weight:bold;letter-spacing:1px;color:#667085;margin:16px 0 5px 0">${copy.scale}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT};"><tr>${scaleCells}</tr><tr>${scaleStrip}</tr></table><div style="font-family:${FONT};font-size:10px;font-weight:bold;letter-spacing:1px;color:#667085;margin:16px 0 3px 0">${copy.position}</div>${marker}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${bar}</tr></table><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT};font-size:9.5px;color:#98A2B3"><tr><td width="40%">0</td><td width="15%">40</td><td width="15%">55</td><td width="25%">70</td><td width="5%" align="right">100</td></tr></table><div style="margin:22px 0 0 0;padding:14px 16px;border:1px solid #EAECF0;background:#FAFAFB;font-size:13px;line-height:1.6;color:#3C4858"><div style="font-weight:bold;color:#142B51;margin-bottom:4px">${copy.whatHead}</div>${copy.whatBody}<ul style="margin:6px 0 0 18px;padding:0">${copy.whatList.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 6px 0;border:1px solid #D0D5DD"><tr><td style="padding:14px 16px 0 16px;font-size:13px;line-height:1.5"><div style="font-weight:bold;color:#1B2533">${esc(copy.reportTitle(input.code))}</div><div style="color:#667085;font-size:12px">${copy.reportDesc}</div></td></tr><tr><td style="padding:12px 16px 0 16px"><div style="font-size:10px;font-weight:bold;letter-spacing:1px;color:#667085;margin:0 0 6px 0">${copy.teaserHead}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${teasers}</tr></table></td></tr><tr><td style="padding:12px 16px 0 16px;font-size:13px;line-height:1.5"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#1B2533">${priceRow(copy.single, singleNow, PAYMENT_OPTIONS.single.normal)}${priceRow(copy.bundle, bundleNow, PAYMENT_OPTIONS.package3.normal)}</table>${
        promoActive ? `<div style="font-size:11.5px;color:#667085;margin-top:4px">${esc(copy.promoUntil(promoDateText))}</div>` : ''
    }<div style="font-size:12px;color:#3C4858;margin-top:8px">${copy.afterBuy}</div></td></tr><tr><td style="padding:14px 16px 16px 16px"><a href="${esc(input.reportLink)}" style="display:inline-block;background:#142B51;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13.5px;padding:11px 20px">${copy.button}</a><span style="font-size:11.5px;color:#667085;padding-left:10px">${copy.confirmed}</span></td></tr></table><p style="font-size:11.5px;line-height:1.55;color:#667085;margin:14px 0 0 0">${copy.disclaimer}${showNotice ? '' : copy.disclaimerSafety}</p></td></tr><tr><td style="padding:16px 28px 22px 28px;border-top:1px solid #EAECF0;font-size:11px;line-height:1.55;color:#667085"><b style="color:#142B51">${copy.org}</b><br>WhatsApp <a href="https://wa.me/6285156410912" style="color:#142B51">+62 851-5641-0912</a> | <a href="mailto:contact@attentiveid.com" style="color:#142B51">contact@attentiveid.com</a> | <a href="https://attentiveid.com" style="color:#142B51">attentiveid.com</a><br>${copy.confidential}</td></tr></table></div>`

    const text = [
        `${copy.summary} | ${input.code}`,
        copy.heading,
        '',
        copy.greeting(input.name, date),
        '',
        ...(showNotice ? [`${copy.noticeBold}${copy.noticeRest}`, ''] : []),
        `${copy.mhi}: ${mhiText} (${copy.outOf})`,
        `${copy.status}: ${copy.levelOf(level, levelName)}`,
        '',
        copy.whatHead,
        copy.whatBody,
        ...copy.whatList.map((line) => `- ${line}`),
        '',
        copy.reportTitle(input.code),
        copy.reportDesc,
        `${copy.teaserSingle}: ${origin}/assessments-static/contoh-laporan-1x.pdf`,
        `${copy.teaserPackage}: ${origin}/assessments-static/contoh-laporan-paket-3x.pdf`,
        `${copy.single}: ${rupiah(singleNow)}${promoActive ? ` (${rupiah(PAYMENT_OPTIONS.single.normal)})` : ''}`,
        `${copy.bundle}: ${rupiah(bundleNow)}${promoActive ? ` (${rupiah(PAYMENT_OPTIONS.package3.normal)})` : ''}`,
        ...(promoActive ? [copy.promoUntil(promoDateText)] : []),
        copy.afterBuy,
        '',
        `${copy.button}: ${input.reportLink}`,
        copy.confirmed,
        '',
        `${copy.disclaimer}${showNotice ? '' : copy.disclaimerSafety}`.trim(),
        '',
        `${copy.org} | WhatsApp +62 851-5641-0912 | contact@attentiveid.com | attentiveid.com`,
        copy.confidential
    ].join('\n')

    return { subject: copy.subject(input.code), html, text }
}

