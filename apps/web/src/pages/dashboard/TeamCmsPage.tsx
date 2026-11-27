import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { TEAM_GROUP_LABELS, TEAM_GROUPS, validateTeamMember, type TeamGroup, type TeamMemberDto } from '@attentiveid/shared'
import { listAllTeam, removeTeamMember, saveTeamMember } from '@/features/team/service'
import { useTx } from '@/features/i18n/use-tx'

const empty = { team: 'psych' as TeamGroup, name: '', roleId: '', roleEn: '', photoUrl: '', sortOrder: '0', visible: true }
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500'

/** Names under the team sub-sections of the Our Practitioners page. */
export function TeamCmsPage() {
  const { tx, isEn } = useTx()
  const lang = isEn ? 'en' : 'id'
  // The shared validator answers in Indonesian; these are its English words, by field.
  const englishErrors: Record<string, string> = {
    team: 'Choose a team.',
    name: 'Name is required (2 to 120 characters).',
    roleId: 'At most 160 characters.',
    roleEn: 'At most 160 characters.',
    photoUrl: 'The photo address must start with / or https://.',
    sortOrder: 'Order must be a number from 0 to 9999.',
  }
  const [members, setMembers] = useState<TeamMemberDto[] | null>(null)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ bad: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const fail = (error: unknown) => setMessage({ bad: true, text: error instanceof Error ? error.message : tx('Gagal.', 'Failed.') })
  const load = useCallback(() => listAllTeam().then(setMembers, fail), [])

  useEffect(() => {
    void load()
  }, [load])

  const reset = () => {
    setForm(empty)
    setEditing(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const checked = validateTeamMember({ ...form, sortOrder: Number(form.sortOrder) })
    if (!checked.ok) return setMessage({ bad: true, text: Object.entries(checked.errors).map(([key, value]) => (isEn ? englishErrors[key] ?? value : value)).join(' ') })
    setBusy(true)
    try {
      await saveTeamMember(checked.value, editing ?? undefined)
      setMessage({ bad: false, text: tx('Tersimpan.', 'Saved.') })
      reset()
      await load()
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (member: TeamMemberDto) => {
    if (!window.confirm(tx(`Hapus ${member.name} dari tim?`, `Remove ${member.name} from the team?`))) return
    try {
      await removeTeamMember(member.id)
      if (editing === member.id) reset()
      await load()
    } catch (error) {
      fail(error)
    }
  }

  const text = (key: 'name' | 'roleId' | 'roleEn' | 'photoUrl' | 'sortOrder', label: string, type = 'text') => (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      <input className={field} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} type={type} value={form[key]} />
    </label>
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900" data-route-heading tabIndex={-1}>{tx('Tim di Halaman Praktisi', 'Team on the Practitioners page')}</h1>
        <p className="mt-1 text-sm text-slate-600">{tx('Bagian tim baru tampil di situs setelah ada nama yang ditampilkan.', 'A team section appears on the site once it has a name that is shown.')}</p>
      </header>

      {message && (
        <p className={`rounded-lg border px-4 py-3 text-sm ${message.bad ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role={message.bad ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2" noValidate onSubmit={submit}>
        <label className="block text-xs font-semibold text-slate-700">
          {tx('Tim', 'Team')}
          <select className={field} onChange={(event) => setForm((current) => ({ ...current, team: event.target.value as TeamGroup }))} value={form.team}>
            {TEAM_GROUPS.map((group) => <option key={group} value={group}>{TEAM_GROUP_LABELS[group][lang]}</option>)}
          </select>
        </label>
        {text('name', tx('Nama', 'Name'))}
        {text('roleId', tx('Jabatan (Indonesia)', 'Role (Indonesian)'))}
        {text('roleEn', tx('Jabatan (English)', 'Role (English)'))}
        {text('photoUrl', tx('Alamat foto (boleh kosong)', 'Photo address (may be empty)'))}
        {text('sortOrder', tx('Urutan', 'Order'), 'number')}
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input checked={form.visible} className="size-4" onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} type="checkbox" />
          {tx('Tampilkan di situs', 'Show on the site')}
        </label>
        <div className="flex items-center justify-end gap-3">
          {editing && <button className="cursor-pointer text-sm font-semibold text-slate-600 underline" onClick={reset} type="button">{tx('Batal', 'Cancel')}</button>}
          <button className="cursor-pointer rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
            {editing ? tx('Simpan perubahan', 'Save changes') : tx('Tambah', 'Add')}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white">
        {members === null ? (
          <p className="p-4 text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>
        ) : members.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">{tx('Belum ada nama.', 'No names yet.')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={member.id}>
                <span className="text-sm">
                  <span className="font-semibold text-slate-900">{member.name}</span>
                  <span className="text-slate-500"> · {TEAM_GROUP_LABELS[member.team][lang]}{(isEn ? member.roleEn || member.roleId : member.roleId) ? ` · ${isEn ? member.roleEn || member.roleId : member.roleId}` : ''}{member.visible ? '' : tx(' · disembunyikan', ' · hidden')}</span>
                </span>
                <span className="flex gap-3">
                  <button
                    aria-label={tx(`Ubah ${member.name}`, `Edit ${member.name}`)}
                    className="cursor-pointer text-sm font-semibold text-slate-700 underline"
                    onClick={() => {
                      setEditing(member.id)
                      setForm({ team: member.team, name: member.name, roleId: member.roleId, roleEn: member.roleEn, photoUrl: member.photoUrl ?? '', sortOrder: String(member.sortOrder), visible: member.visible })
                      setMessage(null)
                    }}
                    type="button"
                  >
                    {tx('Ubah', 'Edit')}
                  </button>
                  <button aria-label={tx(`Hapus ${member.name}`, `Remove ${member.name}`)} className="cursor-pointer text-sm font-semibold text-rose-700 underline" onClick={() => void remove(member)} type="button">
                    {tx('Hapus', 'Remove')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
