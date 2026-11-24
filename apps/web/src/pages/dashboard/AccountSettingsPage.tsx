import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, Loader2, Monitor, Moon, Sun } from 'lucide-react'
import { IDLE_TIMEOUT_DEFAULT_MINUTES } from '@attentiveid/shared'
import { getActiveAuthHeaders, useAuth } from '@/features/auth/auth-context'
import { useThemeChoice, type ThemeChoice } from '@/features/dashboard/admin-theme'
import { useTx } from '@/features/i18n/use-tx'

const CHOICES = [5, 10, 15, 20, 30, 45, 60, 90, 120]
const MIN_PASSWORD = 12

type Message = { ok: boolean; text: string } | null

const inputClass =
  'mt-1 block w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  )
}

function Status({ message }: { message: Message }) {
  if (!message) return null
  return (
    <span className={`flex items-center gap-1.5 text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`} role="status">
      {message.ok && <CheckCircle2 aria-hidden="true" className="size-4" />}
      {message.text}
    </span>
  )
}

/** My account settings: password, how long the portal waits before signing me out, and the look (light or dark). */
export function AccountSettingsPage() {
  const { tx } = useTx()
  const navigate = useNavigate()
  const { user, refreshSession, logout } = useAuth()
  const [theme, setTheme] = useThemeChoice()

  // --- inactivity limit ---
  const current = user?.idleTimeoutMinutes ?? IDLE_TIMEOUT_DEFAULT_MINUTES
  const [minutes, setMinutes] = useState<number>(current)
  const [timeoutBusy, setTimeoutBusy] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState<Message>(null)

  const saveTimeout = async () => {
    setTimeoutBusy(true)
    setTimeoutMessage(null)
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
      setTimeoutMessage({ ok: true, text: tx('Tersimpan. Berlaku mulai sekarang.', 'Saved. It applies from now on.') })
    } catch (caught) {
      setTimeoutMessage({ ok: false, text: caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Could not save.') })
    } finally {
      setTimeoutBusy(false)
    }
  }

  // --- password ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<Message>(null)

  const passwordProblem = (): string | null => {
    if (!currentPassword) return tx('Isi password saat ini.', 'Enter your current password.')
    if (newPassword.length < MIN_PASSWORD) return tx(`Password baru minimal ${MIN_PASSWORD} karakter.`, `The new password needs at least ${MIN_PASSWORD} characters.`)
    if (newPassword === currentPassword) return tx('Password baru harus berbeda dari yang sekarang.', 'The new password must differ from the current one.')
    if (newPassword !== repeatPassword) return tx('Pengulangan password tidak sama.', 'The repeated password does not match.')
    return null
  }

  const savePassword = async () => {
    const problem = passwordProblem()
    if (problem) {
      setPasswordMessage({ ok: false, text: problem })
      return
    }
    setPasswordBusy(true)
    setPasswordMessage(null)
    try {
      const response = await fetch('/api/auth/me/password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getActiveAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json?.message || `${tx('Gagal mengganti password', 'Could not change the password')} (${response.status})`)
      setPasswordMessage({ ok: true, text: tx('Password diganti. Anda akan diminta masuk lagi.', 'Password changed. You will be asked to sign in again.') })
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
      window.setTimeout(() => {
        void logout().finally(() => navigate('/portal-gate'))
      }, 1600)
    } catch (caught) {
      setPasswordMessage({ ok: false, text: caught instanceof Error ? caught.message : tx('Gagal mengganti password.', 'Could not change the password.') })
    } finally {
      setPasswordBusy(false)
    }
  }

  const themes: Array<{ value: ThemeChoice; label: string; icon: ReactNode }> = [
    { value: 'light', label: tx('Terang', 'Light'), icon: <Sun aria-hidden="true" className="size-4" /> },
    { value: 'dark', label: tx('Gelap', 'Dark'), icon: <Moon aria-hidden="true" className="size-4" /> },
    { value: 'system', label: tx('Ikuti perangkat', 'Match device'), icon: <Monitor aria-hidden="true" className="size-4" /> },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Pengaturan Akun', 'Account settings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {user?.name} · {user?.email} · <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      <Section title={tx('Ganti password', 'Change password')}>
        <p className="text-sm text-slate-600">
          {tx(
            `Minimal ${MIN_PASSWORD} karakter. Setelah diganti, semua perangkat keluar otomatis dan Anda masuk lagi dengan password baru.`,
            `At least ${MIN_PASSWORD} characters. After the change every device is signed out and you sign in again with the new password.`,
          )}
        </p>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            void savePassword()
          }}
        >
          <label className="block text-sm font-semibold text-slate-800">
            {tx('Password saat ini', 'Current password')}
            <input
              autoComplete="current-password"
              className={inputClass}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            {tx('Password baru', 'New password')}
            <input
              autoComplete="new-password"
              className={inputClass}
              onChange={(event) => setNewPassword(event.target.value)}
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            {tx('Ulangi password baru', 'Repeat new password')}
            <input
              autoComplete="new-password"
              className={inputClass}
              onChange={(event) => setRepeatPassword(event.target.value)}
              type={showPasswords ? 'text' : 'password'}
              value={repeatPassword}
            />
          </label>
          <button
            className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            onClick={() => setShowPasswords((value) => !value)}
            type="button"
          >
            {showPasswords ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            {showPasswords ? tx('Sembunyikan', 'Hide') : tx('Tampilkan', 'Show')}
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              disabled={passwordBusy || !currentPassword || !newPassword || !repeatPassword}
              type="submit"
            >
              {passwordBusy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {tx('Ganti password', 'Change password')}
            </button>
            <Status message={passwordMessage} />
          </div>
        </form>
      </Section>

      <Section title={tx('Keluar otomatis bila tidak aktif', 'Sign out when inactive')}>
        <p className="text-sm text-slate-600">
          {tx(
            'Bila Anda tidak mengetik, menggulir, atau mengklik di portal selama waktu ini, Anda akan keluar otomatis. Semenit sebelumnya muncul pertanyaan "Apakah Anda masih di sini?"; tekan Ya untuk melanjutkan. Aktivitas hanya dicatat di peramban Anda, di dalam situs ini.',
            'If you do not type, scroll or click in the portal for this long, you are signed out automatically. A minute before, the question "Are you still there?" appears; press Yes to stay. Activity is recorded only in your browser, inside this website.',
          )}
        </p>
        <label className="block text-sm font-semibold text-slate-800">
          {tx('Batas waktu tidak aktif', 'Inactivity limit')}
          <select className={`${inputClass} max-w-xs`} onChange={(event) => setMinutes(Number(event.target.value))} value={minutes}>
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
            disabled={timeoutBusy || minutes === current}
            onClick={() => void saveTimeout()}
            type="button"
          >
            {timeoutBusy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {tx('Simpan', 'Save')}
          </button>
          <Status message={timeoutMessage} />
        </div>
      </Section>

      <Section title={tx('Tampilan', 'Appearance')}>
        <p className="text-sm text-slate-600">
          {tx('Tema portal. Pilihan ini hanya tersimpan di peramban ini dan tidak mengubah situs publik.', 'The portal theme. This choice is kept only in this browser and does not change the public website.')}
        </p>
        <div aria-label={tx('Tema', 'Theme')} className="flex flex-wrap gap-2" role="radiogroup">
          {themes.map((option) => (
            <button
              aria-checked={theme === option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                theme === option.value ? 'border-navy-700 bg-navy-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              key={option.value}
              onClick={() => setTheme(option.value)}
              role="radio"
              type="button"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
