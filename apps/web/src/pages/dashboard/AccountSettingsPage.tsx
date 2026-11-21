import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { IDLE_TIMEOUT_DEFAULT_MINUTES } from '@attentiveid/shared'
import { getActiveAuthHeaders, useAuth } from '@/features/auth/auth-context'
import { useTx } from '@/features/i18n/use-tx'

const CHOICES = [5, 10, 15, 20, 30, 45, 60, 90, 120]

/** My account settings: for now, how long the portal waits without activity before signing me out. */
export function AccountSettingsPage() {
  const { tx } = useTx()
  const { user, refreshSession } = useAuth()
  const current = user?.idleTimeoutMinutes ?? IDLE_TIMEOUT_DEFAULT_MINUTES
  const [minutes, setMinutes] = useState<number>(current)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/auth/me/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getActiveAuthHeaders() },
        body: JSON.stringify({ idleTimeoutMinutes: minutes }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json?.message || `${tx('Gagal menyimpan', 'Could not save')} (${response.status})`)
      await refreshSession()
      setMessage({ ok: true, text: tx('Tersimpan. Berlaku mulai sekarang.', 'Saved. It applies from now on.') })
    } catch (caught) {
      setMessage({ ok: false, text: caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Could not save.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Pengaturan Akun', 'Account settings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{user?.name}</p>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">{tx('Keluar otomatis bila tidak aktif', 'Sign out when inactive')}</h2>
        <p className="text-sm text-slate-600">
          {tx(
            'Bila Anda tidak mengetik, menggulir, atau mengklik di portal selama waktu ini, Anda akan keluar otomatis. Semenit sebelumnya muncul pertanyaan "Apakah Anda masih di sini?"; tekan Ya untuk melanjutkan. Aktivitas hanya dicatat di peramban Anda, di dalam situs ini.',
            'If you do not type, scroll or click in the portal for this long, you are signed out automatically. A minute before, the question "Are you still there?" appears; press Yes to stay. Activity is recorded only in your browser, inside this website.',
          )}
        </p>
        <label className="block text-sm font-semibold text-slate-800">
          {tx('Batas waktu tidak aktif', 'Inactivity limit')}
          <select
            className="mt-1 block w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
            onChange={(event) => setMinutes(Number(event.target.value))}
            value={minutes}
          >
            {CHOICES.map((choice) => (
              <option key={choice} value={choice}>
                {choice} {tx('menit', 'minutes')}
                {choice === IDLE_TIMEOUT_DEFAULT_MINUTES ? ` (${tx('bawaan', 'default')})` : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            disabled={busy || minutes === current}
            onClick={() => void save()}
            type="button"
          >
            {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {tx('Simpan', 'Save')}
          </button>
          {message && (
            <span className={`flex items-center gap-1.5 text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`} role="status">
              {message.ok && <CheckCircle2 aria-hidden="true" className="size-4" />}
              {message.text}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
