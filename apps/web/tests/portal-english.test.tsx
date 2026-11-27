import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import en from '../src/i18n/locales/en.json'
import id from '../src/i18n/locales/id.json'
import i18n from '../src/i18n'
import { TeamCmsPage } from '../src/pages/dashboard/TeamCmsPage'

vi.mock('../src/features/team/service', () => ({ listAllTeam: async () => [], removeTeamMember: vi.fn(), saveTeamMember: vi.fn() }))

describe('portal in English', () => {
  beforeAll(async () => { await i18n.changeLanguage('en') })

  it('shows the Team page in English', async () => {
    render(<TeamCmsPage />)
    expect(screen.getByRole('heading', { name: 'Team on the Practitioners page' })).toBeInTheDocument()
    expect(await screen.findByText('No names yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Psychologists' })).toBeInTheDocument()
  })

  it('has every menu label in both languages', () => {
    for (const key of ['navTeam', 'navPrayers', 'navAccount', 'navReports', 'navUpdates', 'menuShow', 'menuHide'] as const) {
      expect(en.dashboard[key]).toBeTruthy()
      expect(id.dashboard[key]).toBeTruthy()
    }
  })
})
