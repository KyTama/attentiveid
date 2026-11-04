/**
 * Accounts that can see the dashboard's "Experimental" section.
 *
 * This only hides the UI (nav and routes). The underlying API endpoints keep
 * their normal role checks, so it is a visibility gate, not a security boundary.
 * Override at build time with VITE_EXPERIMENTAL_EMAILS (comma-separated).
 */
const DEFAULT_EXPERIMENTAL_EMAILS = ['nico.alex.ha@gmail.com']

const parseEmails = (raw: string | undefined) =>
  (raw ? raw.split(',') : DEFAULT_EXPERIMENTAL_EMAILS)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

export const EXPERIMENTAL_EMAILS = parseEmails(import.meta.env.VITE_EXPERIMENTAL_EMAILS)

export const canAccessExperimental = (email: string | null | undefined) =>
  Boolean(email) && EXPERIMENTAL_EMAILS.includes((email as string).trim().toLowerCase())
