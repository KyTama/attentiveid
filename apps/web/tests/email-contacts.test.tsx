import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { EmailCategory, EmailContact, EmailImportPlan, UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'
import { filterContacts } from '../src/features/email/filter'

const staff = (role: UserDto['role']): UserDto => ({
  id: `user-${role}`, email: `${role}@example.test`, name: 'Staff User', role, status: 'active',
  psychologistId: role === 'psychologist' ? 'p1' : null, lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
})

const category = (id: string, name: string, builtin = false, count = 0): EmailCategory => ({ id, name, builtin, count })
const CATEGORIES = [category('c1', 'client', true, 1), category('c2', 'business', true, 1), category('c3', 'Mitra'), category('c4', 'Sekolah'), category('c5', 'Alumni')]

const contact = (id: string, over: Partial<EmailContact> = {}): EmailContact => ({
  id, email: `${id}@example.test`, name: '', phone: '', categoryIds: ['c1'], source: 'manual', archivedAt: null,
  createdAt: '2026-11-26T00:00:00Z', updatedAt: '2026-11-26T00:00:00Z', ...over,
})
const CONTACTS = [
  contact('budi', { name: 'Budi Santoso', phone: '+62 812 3456 7890' }),
  contact('sari', { name: 'Sari Dewi', categoryIds: ['c2', 'c5'] }),
]

interface Call { method: string; url: string; body: unknown }

function setup(role: UserDto['role'] = 'admin', contacts = CONTACTS, saveError?: { message: string; errors?: object }) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    const reply = (status: number, json: unknown) => ({ ok: status < 400, status, json: async () => json })
    if (url.includes('/api/auth/')) return reply(200, { status: 'success', accessToken: 'valid.token', user: staff(role) })
    if (!url.includes('/api/admin/email/')) return reply(404, { message: 'Tidak ada.' })
    calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    if (method === 'GET') return reply(200, { status: 'success', data: { contacts: url.includes('archived=1') ? [] : contacts, categories: CATEGORIES } })
    if (saveError) return reply(409, { status: 'error', ...saveError })
    return reply(200, { status: 'success', data: contacts[0] })
  }))
  render(
    <MemoryRouter initialEntries={['/dashboard/email/contacts']}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
  return calls
}

const loaded = () => screen.findByText('Budi Santoso')
const writes = (calls: Call[]) => calls.filter((call) => call.method !== 'GET')

describe('e-mail contacts page', () => {
  beforeEach(async () => { await i18n.changeLanguage('id') })
  afterEach(() => { vi.unstubAllGlobals() })

  it('lists contacts with their categories', async () => {
    setup()
    await loaded()
    expect(screen.getByRole('heading', { name: 'Kontak e-mail' })).toBeInTheDocument()
    const row = screen.getByText('Sari Dewi').closest('li')!
    expect(within(row).getByText('business')).toBeInTheDocument()
    expect(within(row).getByText('Alumni')).toBeInTheDocument()
  })

  it('a psychologist cannot open the page and no contact is requested', async () => {
    const calls = setup('psychologist')
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Kontak e-mail' })).not.toBeInTheDocument())
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })

  it('filters by chip, by the "more" list and by search', async () => {
    const user = userEvent.setup()
    setup()
    await loaded()
    await user.click(screen.getByRole('button', { name: 'business' }))
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument()
    expect(screen.getByText('Sari Dewi')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori lainnya' }), 'c5')
    expect(screen.getByText('Sari Dewi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Semua' }))
    await user.type(screen.getByRole('searchbox', { name: 'Cari kontak' }), '0812345')
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
    expect(screen.queryByText('Sari Dewi')).not.toBeInTheDocument()
  })

  it('adds a contact: client is preselected and the name is suggested from the address', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Tambah kontak' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('checkbox', { name: 'client' })).toBeChecked()
    await user.type(within(dialog).getByLabelText('E-mail'), 'andi.wijaya@example.test')
    await user.tab()
    expect(within(dialog).getByLabelText('Nama')).toHaveValue('Andi Wijaya')
    await user.click(within(dialog).getByRole('checkbox', { name: 'business' }))
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(writes(calls)).toEqual([{ method: 'POST', url: '/api/admin/email/contacts', body: { email: 'andi.wijaya@example.test', name: 'Andi Wijaya', phone: '', categoryIds: ['c1', 'c2'] } }])
  })

  it('does not send a bad address or a contact without a category', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Tambah kontak' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('E-mail'), 'bukan-alamat')
    await user.click(within(dialog).getByRole('checkbox', { name: 'client' }))
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }))
    expect(within(dialog).getByText('Alamat e-mail tidak valid.')).toBeInTheDocument()
    expect(within(dialog).getByText('Pilih minimal satu kategori.')).toBeInTheDocument()
    expect(writes(calls)).toEqual([])
  })

  it('shows the server message when the address already exists and keeps the form', async () => {
    const user = userEvent.setup()
    setup('admin', CONTACTS, { message: 'Alamat e-mail ini sudah ada di kontak (cek juga arsip).' })
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Ubah Budi Santoso' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('sudah ada')
    expect(within(dialog).getByLabelText('E-mail')).toHaveValue('budi@example.test')
  })

  it('deleting asks first; cancel changes nothing', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Hapus Budi Santoso' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Batal' }))
    expect(writes(calls)).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Hapus Budi Santoso' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus permanen' }))
    await waitFor(() => expect(writes(calls)).toEqual([{ method: 'POST', url: '/api/admin/email/contacts/delete', body: { ids: ['budi'] } }]))
  })

  it('a bulk action only touches selected contacts that are still on screen', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await loaded()
    await user.click(screen.getByRole('checkbox', { name: 'Pilih Budi Santoso' }))
    await user.click(screen.getByRole('checkbox', { name: 'Pilih Sari Dewi' }))
    await user.click(screen.getByRole('button', { name: 'business' }))
    expect(screen.getByText('1 dipilih')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Arsipkan' }))
    await waitFor(() => expect(writes(calls)).toEqual([{ method: 'POST', url: '/api/admin/email/contacts/archive', body: { ids: ['sari'], archived: true } }]))
  })

  it('built-in categories cannot be changed; one in use cannot be deleted', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Kategori' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: 'Hapus client' })).not.toBeInTheDocument()
    await user.type(within(dialog).getByRole('textbox', { name: 'Kategori baru' }), 'Kampus')
    await user.click(within(dialog).getByRole('button', { name: 'Tambah' }))
    await waitFor(() => expect(writes(calls)).toEqual([{ method: 'POST', url: '/api/admin/email/categories', body: { name: 'Kampus' } }]))
  })
})

describe('contact search', () => {
  it('finds a number written another way, and combines with the category', () => {
    expect(filterContacts(CONTACTS, 'all', '+62812').map((c) => c.id)).toEqual(['budi'])
    expect(filterContacts(CONTACTS, 'c2', 'budi')).toEqual([])
    expect(filterContacts(CONTACTS, 'c5', '').map((c) => c.id)).toEqual(['sari'])
  })
})

describe('contacts in Excel', () => {
  beforeEach(async () => { await i18n.changeLanguage('id') })
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

  const row = (key: string, email: string) => ({ key, sheet: 'new' as const, row: Number(key.split(':')[1]), email, name: '', phone: '', categories: ['client'] })
  const PLAN: EmailImportPlan = {
    added: [row('new:2', 'baru@example.test')],
    edited: [{ ...row('existing:2', 'budi@example.test'), sheet: 'existing', contactId: 'budi', version: 'v', changed: ['name'] }],
    overlapping: [
      { ...row('new:3', 'sari@example.test'), reason: 'email_exists', canInclude: false },
      { ...row('new:4', 'kembar@example.test'), reason: 'phone_exists', canInclude: true },
    ],
    invalid: [{ key: 'new:5', sheet: 'new', row: 5, email: 'rusak', reason: 'email' }],
    conflicts: [], unchanged: 3, newCategories: [],
  }

  async function openDialog(plan = PLAN) {
    const calls = setup()
    const base = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const reply = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ status: 'success', data }) })
      if (url.endsWith('/import')) { calls.push({ method: 'POST', url, body: 'file' }); return reply({ id: 'imp1', plan }) }
      if (url.endsWith('/apply')) { calls.push({ method: 'POST', url, body: JSON.parse(String(init?.body)) }); return reply({ added: 2, updated: 1, skipped: 0 }) }
      return base(input, init)
    }))
    await loaded()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Excel' }))
    const dialog = screen.getByRole('dialog')
    await user.upload(within(dialog).getByLabelText(/Unggah berkas/), new File(['x'], 'kontak.xlsx'))
    await within(dialog).findByText('3 baris tidak berubah.')
    return { calls, dialog, user }
  }

  it('shows the counts and keeps confirm grey for five seconds, then sends the chosen rows', async () => {
    const { calls, dialog, user } = await openDialog()
    expect(within(dialog).getByText('Baru').nextElementSibling).toHaveTextContent('1')
    expect(within(dialog).getByText('Diubah').nextElementSibling).toHaveTextContent('1')
    expect(within(dialog).getByText('Tumpang tindih').nextElementSibling).toHaveTextContent('2')
    expect(within(dialog).getByText('rusak')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Konfirmasi (5)' })).toBeDisabled()
    // Only the shared-phone row can be added anyway.
    expect(within(dialog).getAllByRole('checkbox', { name: 'Tetap tambahkan' })).toHaveLength(1)
    await user.click(within(dialog).getByRole('checkbox', { name: 'Tetap tambahkan' }))
    const confirm = await within(dialog).findByRole('button', { name: 'Konfirmasi' }, { timeout: 8000 })
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(await within(dialog).findByText('Selesai: 2 ditambahkan, 1 diperbarui, 0 dilewati.')).toBeInTheDocument()
    expect(calls.find((c) => c.url.endsWith('/imp1/apply'))?.body).toEqual({ include: ['new:4'] })
    expect(within(dialog).queryByRole('button', { name: /Konfirmasi/ })).not.toBeInTheDocument()
  }, 20000)

  it('with nothing to change there is no confirm button', async () => {
    const { dialog } = await openDialog({ added: [], edited: [], overlapping: [], invalid: [], conflicts: [], unchanged: 3, newCategories: [] })
    expect(within(dialog).getByText('Tidak ada yang perlu disimpan.')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /Konfirmasi/ })).not.toBeInTheDocument()
  })
})
