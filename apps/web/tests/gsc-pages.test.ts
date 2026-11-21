import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (name: string) => readFileSync(resolve(process.cwd(), 'public/assessments-static', name), 'utf8')

/** Hosts the site CSP lets a page load styles and fonts from (style-src / font-src) */
const ALLOWED_EXTERNAL_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

function externalResourceHosts(html: string): string[] {
  const hosts = new Set<string>()
  for (const tag of html.match(/<(?:link|script|img|iframe|source|video|audio)\b[^>]*>/gi) ?? []) {
    for (const m of tag.matchAll(/\b(?:src|href)\s*=\s*"(https?:\/\/[^"]+)"/gi)) hosts.add(new URL(m[1] as string).host)
  }
  for (const m of html.matchAll(/url\(\s*['"]?(https?:\/\/[^)'"]+)/gi)) hosts.add(new URL(m[1] as string).host)
  for (const m of html.matchAll(/@import\s+(?:url\()?\s*['"]?(https?:\/\/[^)'";]+)/gi)) hosts.add(new URL(m[1] as string).host)
  return [...hosts].sort()
}

describe('the GSC participant page file (gsc.html)', () => {
  const html = read('gsc.html')

  it('posts the session as JSON to the site API', () => {
    expect(html).toContain("ENDPOINT:'/api/public/assessments/gsc'")
    expect(html).toContain("fetch(CONFIG.ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'}")
    expect(html).toContain('body:JSON.stringify(payload)')
  })

  it('has no leftover empty endpoint or Apps Script URL', () => {
    expect(html).not.toMatch(/ENDPOINT\s*:\s*(''|"")/)
    expect(html).not.toContain('script.google.com')
    expect(html).not.toContain('/exec')
  })

  it('has developer mode switched off and no dev URL switch', () => {
    expect(html).toMatch(/DEV:false\b/)
    expect(html).not.toMatch(/DEV\s*:\s*true/)
    expect(html).toContain('let DEV=false;')
    // no code reads ?dev=1 (only a stale comment mentions it) or a dev key from the URL
    expect(html).not.toMatch(/location\.(search|hash)[^;\n]{0,80}dev/i)
    expect(html).not.toMatch(/URLSearchParams[^;\n]{0,80}dev/i)
  })

  it('sends staff to the counselor console of this site with the session in the hash', () => {
    expect(html).toContain("COUNSELOR_URL:'https://attentiveid.com/assessments/goal-compass/konselor'")
    expect(html).toContain("counselorUrl:CONFIG.COUNSELOR_URL+'#d='+code")
  })

  it('sends the fields the API validates, with the goals count limits of the validator', () => {
    for (const field of ['id:S.id', 'lang:LANG', 'name:S.profile.name', 'age:+S.profile.age', 'sex:S.profile.sex', 'edu:S.profile.edu', 'email:S.profile.email', 'wa:normWA(S.profile.wa)', 'minutes:', 'brief:{', 'goals:data().goals.map(g=>g.name)', 'code,']) {
      expect(html).toContain(field)
    }
    expect(html).toContain('MIN_GOALS:6,MAX_GOALS:12')
  })

  it('loads nothing from outside the site except the fonts the CSP allows', () => {
    expect(html).not.toMatch(/<script[^>]*\ssrc=/i)
    expect(externalResourceHosts(html).every((h) => ALLOWED_EXTERNAL_HOSTS.includes(h))).toBe(true)
    expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\(|fbq\(/i)
  })
})

describe('the GSC counselor console file (gsc-konselor.html)', () => {
  const html = read('gsc-konselor.html')

  it('has developer mode switched off', () => {
    expect(html).toContain('KCONFIG={DEV:false}')
    expect(html).toContain('let KDEV=false;')
    expect(html).not.toMatch(/DEV\s*:\s*true/)
  })

  it('still opens a session from #d=<code>', () => {
    expect(html).toContain("h.startsWith('#d=')")
    expect(html).toContain('setData(await unpack(h))')
  })

  it('is not indexed and loads nothing from outside the site except fonts', () => {
    expect(html).toContain('<meta name="robots" content="noindex,nofollow">')
    expect(html).not.toMatch(/<script[^>]*\ssrc=/i)
    expect(externalResourceHosts(html).every((h) => ALLOWED_EXTERNAL_HOSTS.includes(h))).toBe(true)
    expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\(|fbq\(/i)
  })

  it('does not post anything anywhere (the console only reads)', () => {
    expect(html).not.toMatch(/fetch\(/)
    expect(html).not.toMatch(/XMLHttpRequest|sendBeacon/)
  })
})
