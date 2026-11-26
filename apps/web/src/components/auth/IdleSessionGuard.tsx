import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { IDLE_TIMEOUT_DEFAULT_MINUTES } from '@attentiveid/shared'
import { useAuth } from '@/features/auth/auth-context'
import { ACTIVITY_EVENTS, idleStateAt, readLastActivity, readStoredActivity, writeLastActivity, type IdleState } from '@/features/auth/idle-session'
import { useTx } from '@/features/i18n/use-tx'

/**
 * Signs the person out after a stretch without activity (their own setting, 15 minutes by default).
 * A minute before, a dialog asks "Are you still there?"; the Yes button keeps the session, and no answer signs them out.
 */
export function IdleSessionGuard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { tx } = useTx()
  const minutes = user?.idleTimeoutMinutes ?? IDLE_TIMEOUT_DEFAULT_MINUTES
  const userId = user?.id ?? null
  // The sign-out and navigate functions change identity on every render; keep them in a ref so the timer is not restarted by them.
  const actions = useRef({ logout, navigate })
  useEffect(() => {
    actions.current = { logout, navigate }
  })
  const [state, setState] = useState<IdleState>({ kind: 'active' })
  const last = useRef(0)
  const warningShown = useRef(false)
  const stage = useRef<IdleState['kind']>('active')

  const markActivity = useCallback(() => {
    // While the question is on screen only the Yes button counts, so a passing mouse move cannot dismiss it unseen.
    if (warningShown.current) return
    const now = Date.now()
    if (now - last.current < 1000) return
    last.current = now
    writeLastActivity(now)
  }, [])

  useEffect(() => {
    if (!userId) return
    // The saved time, not "now": reloading or coming back to the portal must not restart the idle clock.
    last.current = readStoredActivity() || Date.now()
    writeLastActivity(last.current)
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, markActivity, { capture: true, passive: true })
    const timer = window.setInterval(() => {
      // Another tab of the portal may have seen activity.
      last.current = readLastActivity(last.current)
      const next = idleStateAt(Date.now(), last.current, minutes)
      warningShown.current = next.kind === 'warning'
      if (next.kind === 'expired' && stage.current !== 'expired') {
        stage.current = 'expired'
        void actions.current.logout().finally(() => actions.current.navigate('/portal-gate', { replace: true }))
      } else if (next.kind !== 'expired') {
        stage.current = next.kind
      }
      setState((current) => (current.kind === next.kind && (next.kind !== 'warning' || (current.kind === 'warning' && current.secondsLeft === next.secondsLeft)) ? current : next))
    }, 1000)
    return () => {
      window.clearInterval(timer)
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActivity, { capture: true })
    }
  }, [userId, minutes, markActivity])

  if (!user || state.kind !== 'warning') return null

  const stay = () => {
    const now = Date.now()
    last.current = now
    warningShown.current = false
    stage.current = 'active'
    writeLastActivity(now)
    setState({ kind: 'active' })
  }

  const left = state.secondsLeft
  return (
    <div aria-live="assertive" className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="idle-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <Clock aria-hidden="true" className="mx-auto size-9 text-amber-600" />
        <h2 className="mt-3 text-lg font-bold text-slate-900" id="idle-title">
          {tx('Apakah Anda masih di sini?', 'Are you still there?')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {tx(`Tidak ada aktivitas. Anda akan keluar otomatis dalam ${left} detik.`, `No activity. You will be signed out automatically in ${left} seconds.`)}
        </p>
        <button
          autoFocus
          className="mt-5 w-full cursor-pointer rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          onClick={stay}
          type="button"
        >
          {tx('Ya, saya masih di sini', "Yes, I'm still here")}
        </button>
      </div>
    </div>
  )
}
