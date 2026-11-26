import { normalizeContactPhone, type EmailContact } from '@attentiveid/shared'

/** "all" or a category id. */
export type ContactFilter = string

export function filterContacts(contacts: EmailContact[], filter: ContactFilter, search: string): EmailContact[] {
  const text = search.trim().toLowerCase()
  // Part of a number: "0812…" must also find "+62 812…", so both sides use the leading 0.
  const typed = /^[\d\s+().-]{4,}$/.test(search.trim()) ? search.replace(/\D/g, '') : ''
  const digits = typed.startsWith('62') ? `0${typed.slice(2)}` : typed
  return contacts.filter((contact) => {
    if (filter !== 'all' && !contact.categoryIds.includes(filter)) return false
    if (!text) return true
    return contact.email.includes(text)
      || contact.name.toLowerCase().includes(text)
      || contact.phone.toLowerCase().includes(text)
      || Boolean(digits && normalizeContactPhone(contact.phone).includes(digits))
  })
}
