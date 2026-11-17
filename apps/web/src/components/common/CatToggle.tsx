import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Cat } from 'lucide-react'
import { catsAllowedOn } from '@attentiveid/shared'
import { useCatPreference } from '@/features/cats/cat-preference'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'
import { useTx } from '@/features/i18n/use-tx'

/**
 * A small button for visitors: "play with the cats" on/off. Off until the visitor turns it on.
 * Shown only on pages where the admin allows cats (Pengaturan Situs > Kucing jalan-jalan).
 */
export function CatToggle() {
  const { pathname } = useLocation()
  const { cats } = useSiteSettings()
  const { tx } = useTx()
  const [on, setOn] = useCatPreference()
  // A short "meow" bubble the first time the visitor turns the cats on.
  const [meow, setMeow] = useState(false)

  useEffect(() => {
    if (!meow) return
    const timer = window.setTimeout(() => setMeow(false), 2600)
    return () => window.clearTimeout(timer)
  }, [meow])

  if (!catsAllowedOn(cats, pathname)) return null

  const label = on ? tx('Matikan kucing', 'Turn the cats off') : tx('Main bareng kucing', 'Play with the cats')

  return (
    <div className="fixed bottom-4 left-4 z-60 flex items-end gap-2 sm:bottom-5 sm:left-5" data-cat-toggle>
      <button
        aria-label={label}
        aria-pressed={on}
        className={`group relative flex size-12 cursor-pointer items-center justify-center rounded-full border shadow-lg outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          on ? 'border-primary bg-primary text-secondary' : 'border-secondary/15 bg-white/95 text-secondary hover:bg-white'
        }`}
        onClick={() => {
          const next = !on
          setOn(next)
          setMeow(next)
        }}
        title={label}
        type="button"
      >
        <Cat aria-hidden="true" className="size-6 stroke-[1.75]" />
        <span
          aria-hidden="true"
          className={`absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white ${on ? 'bg-emerald-500' : 'bg-secondary/30'}`}
        />
      </button>
      {meow ? (
        <span aria-live="polite" className="mb-2 rounded-2xl rounded-bl-sm bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-md" role="status">
          {tx('Meong! 🐾', 'Meow! 🐾')}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  )
}
