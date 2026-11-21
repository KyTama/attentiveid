import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'

describe('/assessments', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('lists the assessments: each assessment opens its own form page', async () => {
    render(
      <MemoryRouter initialEntries={['/assessments']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /get to know yourself better/i })).toBeInTheDocument()
    // a plain link (full page load): the form is its own page, not a route of the single-page app
    expect(screen.getAllByRole('link', { name: /start/i })[0]).toHaveAttribute('href', '/assessments/mhcu')
    expect(screen.getByText(/mental health check-up \(mhcu\)/i)).toBeInTheDocument()
    expect(screen.getByText(/goal system compass/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /start/i })).toHaveLength(2)
  })
})

describe('the MHCU form page file', () => {
  const html = readFileSync(resolve(process.cwd(), 'public/assessments-static/mhcu.html'), 'utf8')

  it('posts to the site API as JSON and is not in demo mode', () => {
    expect(html).toContain("var ENDPOINT = '/api/public/assessments/mhcu';")
    expect(html).toContain("'Content-Type':'application/json'")
    expect(html).toContain('var DEMO = false;')
    expect(html).not.toContain('<?!=')
    expect(html).not.toContain('MHCU_DEMO = true')
  })

  it('does not promise an e-mail or a purchase that the site does not do yet', () => {
    expect(html).not.toContain('sedang dikirim ke email Anda')
    expect(html).not.toContain('is being sent to your email')
    expect(html).toContain('#pricebox { display:none !important; }')
  })

  it('keeps the saved draft for a day at most', () => {
    expect(html).toContain('Date.now() - d.ts < 86400000')
    expect(html).toContain("removeItem('mhcu_draft'); } catch(e){} d = null;")
  })
})

describe('nothing is kept on the device after a successful send', () => {
  const read = (name: string) => readFileSync(resolve(process.cwd(), `public/assessments-static/${name}`), 'utf8')

  it('MHCU stops writing its draft once the answers are sent', () => {
    expect(read('mhcu.html')).toContain('function store(){ if (S.done) return;')
  })

  it('Goal System Compass stops saving its state once the answers are sent', () => {
    expect(read('gsc.html')).toContain("function save(){if(S.send&&S.send.state==='ok')return;")
  })

  it('long names wrap on the MHCU review step and the counselor console table scrolls on phones', () => {
    expect(read('mhcu.html')).toContain('dl.kv > *, .rv td { min-width:0; overflow-wrap:anywhere; }')
    expect(read('gsc-konselor.html')).toContain('@media(max-width:560px){.ct{display:block;overflow-x:auto')
  })
})
