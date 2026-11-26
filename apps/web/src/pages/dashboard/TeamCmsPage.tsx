import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { TEAM_GROUP_LABELS, TEAM_GROUPS, validateTeamMember, type TeamGroup, type TeamMemberDto } from '@attentiveid/shared'
import { listAllTeam, removeTeamMember, saveTeamMember } from '@/features/team/service'

const empty = { team: 'psych' as TeamGroup, name: '', roleId: '', roleEn: '', photoUrl: '', sortOrder: '0', visible: true }
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500'

/** Names under the team sub-sections of the Our Practitioners page. */
export function TeamCmsPage() {
  const [members, setMembers] = useState<TeamMemberDto[] | null>(null)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ bad: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const fail = (error: unknown) => setMessage({ bad: true, text: error instanceof Error ? error.message : 'Gagal.' })
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
    if (!checked.ok) return setMessage({ bad: true, text: Object.values(checked.errors).join(' ') })
    setBusy(true)
    try {
      await saveTeamMember(checked.value, editing ?? undefined)
      setMessage({ bad: false, text: 'Tersimpan.' })
      reset()
      await load()
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (member: TeamMemberDto) => {
    if (!window.confirm(`Hapus ${member.name} dari tim?`)) return
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
        <h1 className="text-2xl font-bold text-slate-900" data-route-heading tabIndex={-1}>Tim di Halaman Praktisi</h1>
        <p className="mt-1 text-sm text-slate-600">Bagian tim baru tampil di situs setelah ada nama yang ditampilkan.</p>
      </header>

      {message && (
        <p className={`rounded-lg border px-4 py-3 text-sm ${message.bad ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role={message.bad ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2" noValidate onSubmit={submit}>
        <label className="block text-xs font-semibold text-slate-700">
          Tim
          <select className={field} onChange={(event) => setForm((current) => ({ ...current, team: event.target.value as TeamGroup }))} value={form.team}>
            {TEAM_GROUPS.map((group) => <option key={group} value={group}>{TEAM_GROUP_LABELS[group].id}</option>)}
          </select>
        </label>
        {text('name', 'Nama')}
        {text('roleId', 'Jabatan (Indonesia)')}
        {text('roleEn', 'Jabatan (English)')}
        {text('photoUrl', 'Alamat foto (boleh kosong)')}
        {text('sortOrder', 'Urutan', 'number')}
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input checked={form.visible} className="size-4" onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} type="checkbox" />
          Tampilkan di situs
        </label>
        <div className="flex items-center justify-end gap-3">
          {editing && <button className="cursor-pointer text-sm font-semibold text-slate-600 underline" onClick={reset} type="button">Batal</button>}
          <button className="cursor-pointer rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
            {editing ? 'Simpan perubahan' : 'Tambah'}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white">
        {members === null ? (
          <p className="p-4 text-sm text-slate-500">Memuat...</p>
        ) : members.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Belum ada nama.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={member.id}>
                <span className="text-sm">
                  <span className="font-semibold text-slate-900">{member.name}</span>
                  <span className="text-slate-500"> · {TEAM_GROUP_LABELS[member.team].id}{member.roleId ? ` · ${member.roleId}` : ''}{member.visible ? '' : ' · disembunyikan'}</span>
                </span>
                <span className="flex gap-3">
                  <button
                    aria-label={`Ubah ${member.name}`}
                    className="cursor-pointer text-sm font-semibold text-slate-700 underline"
                    onClick={() => {
                      setEditing(member.id)
                      setForm({ team: member.team, name: member.name, roleId: member.roleId, roleEn: member.roleEn, photoUrl: member.photoUrl ?? '', sortOrder: String(member.sortOrder), visible: member.visible })
                      setMessage(null)
                    }}
                    type="button"
                  >
                    Ubah
                  </button>
                  <button aria-label={`Hapus ${member.name}`} className="cursor-pointer text-sm font-semibold text-rose-700 underline" onClick={() => void remove(member)} type="button">
                    Hapus
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
