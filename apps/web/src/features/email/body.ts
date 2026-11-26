/** "Plain text" bodies are stored as simple HTML with a mark, so the draft opens again as text. */
const MARK = '<div data-text="1">'

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescape = (value: string) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/** Blank line = new paragraph; web addresses become links (so their clicks can be counted). */
export function textToHtml(text: string): string {
  const paragraphs = text.replace(/\r\n/g, '\n').trim().split(/\n{2,}/).filter(Boolean).map((block) => {
    const linked = escape(block).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url.replace(/"/g, '%22')}">${url}</a>`)
    return `<p>${linked.replace(/\n/g, '<br>')}</p>`
  })
  return paragraphs.length ? `${MARK}${paragraphs.join('')}</div>` : ''
}

/** The text again, or null when this body was written as HTML. */
export function htmlToPlain(html: string): string | null {
  if (!html.startsWith(MARK)) return null
  return unescape(
    [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((match) => match[1]!.replace(/<br>/g, '\n').replace(/<\/?a\b[^>]*>/g, ''))
      .join('\n\n'),
  )
}
