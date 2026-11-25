/**
 * The top menu and the footer of the public pages, edited in the portal (Pengaturan Situs).
 * The defaults are what the site showed before these became editable.
 */
import { normalizeLinkUrl } from './link-url'

export const HEADER_MAX_ITEMS = 7
export const HEADER_MAX_CHILDREN = 6
export const FOOTER_MAX_LINKS = 8

export interface BilingualText {
  id: string
  en: string
}

export interface MenuLink {
  id: string
  visible: boolean
  label: BilingualText
  url: string
}

export interface MenuSubItem extends MenuLink {
  /** Shown greyed out with a "coming soon" badge, not clickable. */
  comingSoon: boolean
}

export interface MenuItem extends MenuLink {
  /** When not empty the item opens a dropdown and its own link is not used. */
  children: MenuSubItem[]
}

export interface HeaderSettings {
  items: MenuItem[]
  cta: { visible: boolean; label: BilingualText; url: string }
}

export interface FooterSettings {
  statement: BilingualText
  exploreHeading: BilingualText
  exploreLinks: MenuLink[]
  locationsHeading: BilingualText
  contactHeading: BilingualText
  /** Shown as written; the chat link uses its digits. Empty hides the row. */
  whatsappNumber: string
  instagramLabel: string
  instagramUrl: string
  linkedinLabel: string
  linkedinUrl: string
  email: string
  /** Follows "© <year>". */
  copyright: BilingualText
}

export interface HeaderFooterSettings {
  header: HeaderSettings
  footer: FooterSettings
}

const both = (id: string, en: string): BilingualText => ({ id, en })

export const DEFAULT_HEADER_FOOTER: HeaderFooterSettings = {
  header: {
    items: [
      { id: 'our-services', visible: true, label: both('Layanan kami', 'Our Services'), url: '/our-services', children: [] },
      {
        id: 'our-science',
        visible: true,
        label: both('Riset kami', 'Our Science'),
        url: '',
        children: [
          { id: 'academic-articles', visible: true, label: both('Artikel Ilmiah', 'Academic Articles'), url: '/articles', comingSoon: false },
          { id: 'scientific-brief', visible: true, label: both('Ringkasan Ilmiah', 'Scientific Brief'), url: '/sci-brief', comingSoon: false },
          { id: 'laboratory', visible: true, label: both('Laboratorium', 'Laboratory'), url: '', comingSoon: true },
        ],
      },
      { id: 'psychologists', visible: true, label: both('Praktisi kami', 'Our Practitioners'), url: '/#psychologists', children: [] },
      { id: 'locations', visible: true, label: both('Lokasi', 'Locations'), url: '/#locations', children: [] },
      { id: 'faq', visible: true, label: both('Tanya jawab', 'FAQ'), url: '/#faq', children: [] },
    ],
    cta: { visible: true, label: both('Konsultasi sekarang', 'Plan a session'), url: 'https://booking.attentiveid.com/' },
  },
  footer: {
    statement: both(
      'Dukungan psikologis profesional yang dibangun dari proses mendengarkan, kejelasan, dan koneksi yang terasa tepat untukmu.',
      'Professional psychological support built around listening, clarity, and a connection that feels right for you.',
    ),
    exploreHeading: both('Jelajahi', 'Explore'),
    exploreLinks: [
      { id: 'support', visible: true, label: both('Layanan', 'Services'), url: '/#support' },
      { id: 'psychologists', visible: true, label: both('Praktisi kami', 'Our Practitioners'), url: '/#psychologists' },
      { id: 'locations', visible: true, label: both('Lokasi', 'Locations'), url: '/#locations' },
      { id: 'faq', visible: true, label: both('Tanya jawab', 'FAQ'), url: '/#faq' },
      { id: 'articles', visible: true, label: both('Artikel', 'Articles'), url: '/articles' },
    ],
    locationsHeading: both('Lokasi Praktik', 'Practice Locations'),
    contactHeading: both('Kontak & Informasi', 'Contact & Info'),
    whatsappNumber: '+62 851-5641-0912',
    instagramLabel: 'Instagram: @attentive.id',
    instagramUrl: 'https://instagram.com/attentive.id',
    linkedinLabel: 'LinkedIn: Attentive.id',
    linkedinUrl: 'https://www.linkedin.com/company/biro-psikologi-attentive',
    email: 'contact@attentiveid.com',
    copyright: both('Attentive.id. Seluruh hak dilindungi.', 'Attentive.id. All rights reserved.'),
  },
}

type Raw = Record<string, unknown>
type Errors = Record<string, string>

const record = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Indonesian is required unless `optional`; English falls back to it. */
const readText = (value: unknown, errors: Errors, key: string, max: number, optional = false): BilingualText => {
  const raw = record(value)
  const id = str(raw.id)
  const en = str(raw.en) || id
  if (!id && !optional) errors[key] = 'Teks (Indonesia) wajib diisi.'
  else if (id.length > max || en.length > max) errors[key] = `Maks ${max} karakter.`
  return { id, en }
}

const readUrl = (value: unknown, errors: Errors, key: string, required: boolean): string => {
  const url = normalizeLinkUrl(str(value))
  if (url === null) errors[key] = 'Alamat tautan tidak valid. Pakai /halaman atau https://...'
  else if (!url && required) errors[key] = 'Tautan wajib diisi.'
  return url ?? ''
}

const idMaker = () => {
  const seen = new Set<string>()
  return (value: unknown, fallback: string) => {
    let id = str(value).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || fallback
    while (seen.has(id)) id = `${id}-x`
    seen.add(id)
    return id
  }
}

const readHeader = (input: unknown, errors: Errors): HeaderSettings => {
  const raw = record(input)
  const itemsRaw = list(raw.items)
  if (itemsRaw.length > HEADER_MAX_ITEMS) errors['header.items'] = `Maks ${HEADER_MAX_ITEMS} menu.`
  const itemId = idMaker()
  const items = itemsRaw.slice(0, HEADER_MAX_ITEMS).map((entry, index): MenuItem => {
    const item = record(entry)
    const at = `header.items.${index}`
    const childrenRaw = list(item.children)
    if (childrenRaw.length > HEADER_MAX_CHILDREN) errors[`${at}.children`] = `Maks ${HEADER_MAX_CHILDREN} sub-menu.`
    const childId = idMaker()
    const children = childrenRaw.slice(0, HEADER_MAX_CHILDREN).map((childEntry, childIndex): MenuSubItem => {
      const child = record(childEntry)
      const childAt = `${at}.children.${childIndex}`
      const comingSoon = child.comingSoon === true
      return {
        id: childId(child.id, `sub-${childIndex + 1}`),
        visible: child.visible !== false,
        label: readText(child.label, errors, `${childAt}.label`, 40),
        url: readUrl(child.url, errors, `${childAt}.url`, !comingSoon),
        comingSoon,
      }
    })
    return {
      id: itemId(item.id, `menu-${index + 1}`),
      visible: item.visible !== false,
      label: readText(item.label, errors, `${at}.label`, 40),
      url: readUrl(item.url, errors, `${at}.url`, children.length === 0),
      children,
    }
  })
  const cta = record(raw.cta)
  const ctaVisible = cta.visible !== false
  return {
    items,
    cta: {
      visible: ctaVisible,
      label: readText(cta.label, errors, 'header.cta.label', 40, !ctaVisible),
      url: readUrl(cta.url, errors, 'header.cta.url', ctaVisible),
    },
  }
}

const readFooter = (input: unknown, errors: Errors): FooterSettings => {
  const raw = record(input)
  const linksRaw = list(raw.exploreLinks)
  if (linksRaw.length > FOOTER_MAX_LINKS) errors['footer.exploreLinks'] = `Maks ${FOOTER_MAX_LINKS} tautan.`
  const linkId = idMaker()
  const exploreLinks = linksRaw.slice(0, FOOTER_MAX_LINKS).map((entry, index): MenuLink => {
    const link = record(entry)
    const at = `footer.exploreLinks.${index}`
    return {
      id: linkId(link.id, `link-${index + 1}`),
      visible: link.visible !== false,
      label: readText(link.label, errors, `${at}.label`, 40),
      url: readUrl(link.url, errors, `${at}.url`, true),
    }
  })

  const whatsappNumber = str(raw.whatsappNumber)
  if (whatsappNumber && !/^\+?[\d\s()-]{8,24}$/.test(whatsappNumber)) errors['footer.whatsappNumber'] = 'Nomor WhatsApp tidak valid. Contoh: +62 812-3456-7890'
  const email = str(raw.email)
  if (email && (email.length > 100 || !/^[^\s@<>"?]+@[^\s@<>"?]+\.[^\s@<>"?]+$/.test(email))) errors['footer.email'] = 'Alamat e-mail tidak valid.'

  const plain = (key: 'instagramLabel' | 'linkedinLabel') => {
    const value = str(raw[key])
    if (value.length > 60) errors[`footer.${key}`] = 'Maks 60 karakter.'
    return value
  }
  const social = (key: 'instagramUrl' | 'linkedinUrl') => {
    const value = readUrl(raw[key], errors, `footer.${key}`, false)
    if (value.startsWith('/')) errors[`footer.${key}`] = 'Pakai alamat lengkap https://...'
    return value
  }

  return {
    statement: readText(raw.statement, errors, 'footer.statement', 300, true),
    exploreHeading: readText(raw.exploreHeading, errors, 'footer.exploreHeading', 40),
    exploreLinks,
    locationsHeading: readText(raw.locationsHeading, errors, 'footer.locationsHeading', 40),
    contactHeading: readText(raw.contactHeading, errors, 'footer.contactHeading', 40),
    whatsappNumber,
    instagramLabel: plain('instagramLabel'),
    instagramUrl: social('instagramUrl'),
    linkedinLabel: plain('linkedinLabel'),
    linkedinUrl: social('linkedinUrl'),
    email,
    copyright: readText(raw.copyright, errors, 'footer.copyright', 120),
  }
}

export const validateHeaderFooter = (
  input: unknown,
): { ok: true; value: HeaderFooterSettings } | { ok: false; errors: Record<string, string> } => {
  const raw = record(input)
  const errors: Errors = {}
  // A half-sent request must not wipe the menu or the footer.
  if (!Array.isArray(record(raw.header).items)) errors.header = 'Data menu atas tidak lengkap.'
  if (!Array.isArray(record(raw.footer).exploreLinks)) errors.footer = 'Data footer tidak lengkap.'
  const value = { header: readHeader(raw.header, errors), footer: readFooter(raw.footer, errors) }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value }
}
