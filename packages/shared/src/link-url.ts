/** Internal path ("/x"), https/http URL, or empty. Returns null when unusable. */
export const normalizeLinkUrl = (value: string): string | null => {
  const text = value.trim()
  if (!text) return ''
  if (text.startsWith('/') && !text.startsWith('//') && !/\s/.test(text)) return text
  try {
    const parsed = new URL(text)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null
  } catch {
    return null
  }
}
