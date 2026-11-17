import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { catsAllowedOn } from '@attentiveid/shared'
import { useCatPreference } from '@/features/cats/cat-preference'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'
import { useTx } from '@/features/i18n/use-tx'

/**
 * A paw button for visitors, shown in the header next to the language toggle: play with the cats, on or off.
 * Off until the visitor turns it on. Shown only on pages where the admin allows cats (Pengaturan Situs > Kucing jalan-jalan).
 */
export function CatToggle() {
  const { pathname } = useLocation()
  const { cats } = useSiteSettings()
  const { tx } = useTx()
  const [on, setOn] = useCatPreference()
  // A short "meow" bubble when the visitor turns the cats on.
  const [meow, setMeow] = useState(false)

  useEffect(() => {
    if (!meow) return
    const timer = window.setTimeout(() => setMeow(false), 2600)
    return () => window.clearTimeout(timer)
  }, [meow])

  if (!catsAllowedOn(cats, pathname)) return null

  const label = on ? tx('Matikan kucing', 'Turn the cats off') : tx('Main bareng kucing', 'Play with the cats')

  return (
    <div className="relative" data-cat-toggle>
      <button
        aria-label={label}
        aria-pressed={on}
        className={`flex size-9 cursor-pointer items-center justify-center rounded-xl border shadow-2xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          on ? 'border-primary bg-primary text-secondary hover:bg-[#ffcf4d]' : 'border-secondary/15 bg-white/80 text-secondary hover:border-secondary/30 hover:bg-white'
        }`}
        onClick={() => {
          const next = !on
          setOn(next)
          setMeow(next)
        }}
        title={label}
        type="button"
      >
        <PawPrint aria-hidden="true" className="size-[18px] stroke-[2]" />
      </button>
      {meow ? (
        <span
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-full z-60 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-md"
          role="status"
        >
          {tx('Meong! 🐾', 'Meow! 🐾')}
        </span>
      ) : null}
    </div>
  )
}
