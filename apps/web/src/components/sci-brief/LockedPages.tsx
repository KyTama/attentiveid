import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Lock, Mail, MessageCircle } from 'lucide-react'
import { buildSciBriefAccessRequest } from '@attentiveid/shared'
import { SCI_BRIEF_REQUEST_EMAIL, SCI_BRIEF_REQUEST_WHATSAPP } from '@/features/sci-brief/service'

interface LockedPagesProps {
  title: string
  periodMonth: string
  /** Pages hidden from visitors; the stand-in sheets are never real content. */
  hiddenPages: number
  locale: 'id' | 'en'
}

const FAKE_LINES = ['w-11/12', 'w-full', 'w-10/12', 'w-full', 'w-9/12', 'w-full', 'w-11/12', 'w-8/12', 'w-full', 'w-10/12']

/**
 * The locked part of a brief. The blurred sheets are decorative placeholders
 * (no text from the document), so nothing confidential reaches the browser.
 */
export function LockedPages({ title, periodMonth, hiddenPages, locale }: LockedPagesProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const request = buildSciBriefAccessRequest({
    title,
    periodMonth,
    locale,
    email: SCI_BRIEF_REQUEST_EMAIL,
    whatsappNumber: SCI_BRIEF_REQUEST_WHATSAPP,
  })

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const sheets = Math.min(Math.max(hiddenPages, 1), 2)

  return (
    <section aria-labelledby="sci-brief-locked-title" className="relative mt-6">
      <div aria-hidden="true" className="pointer-events-none select-none space-y-5 blur-[7px]">
        {Array.from({ length: sheets }, (_, sheet) => (
          <div className="aspect-[3/4] w-full space-y-3 rounded-xl border border-secondary/10 bg-white p-8 shadow-xs" key={sheet}>
            <div className="h-5 w-1/2 rounded bg-secondary/20" />
            {FAKE_LINES.concat(FAKE_LINES).map((width, index) => (
              <div className={`h-2.5 rounded bg-secondary/10 ${width}`} key={index} />
            ))}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-[#fbf8f2]/10 via-[#fbf8f2]/70 to-[#fbf8f2] px-4 pt-8">
        <div className="w-full max-w-md rounded-2xl border border-secondary/15 bg-white p-6 text-center shadow-lg" ref={rootRef}>
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-secondary">
            <Lock aria-hidden="true" size={22} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-secondary" id="sci-brief-locked-title">
            {t('sciBrief.lockedTitle')}
          </h2>
          <p className="mt-1.5 text-sm text-secondary/75">{t('sciBrief.lockedBody', { count: hiddenPages })}</p>

          <div className="relative mt-5">
            <button
              aria-controls={menuId}
              aria-expanded={open}
              aria-haspopup="true"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-secondary shadow-xs outline-none transition-colors hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
              onClick={() => setOpen((current) => !current)}
              type="button"
            >
              {t('sciBrief.requestButton')}
              <ChevronDown aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
            </button>

            {open && (
              <ul
                className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-xl border border-secondary/15 bg-white text-left shadow-lg"
                id={menuId}
              >
                <li>
                  <a
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-secondary hover:bg-black/[0.03] focus-visible:bg-black/[0.04] focus-visible:outline-none"
                    href={request.emailUrl}
                    onClick={() => setOpen(false)}
                  >
                    <Mail aria-hidden="true" size={18} />
                    {t('sciBrief.requestEmail')}
                  </a>
                </li>
                <li className="border-t border-secondary/10">
                  <a
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-secondary hover:bg-black/[0.03] focus-visible:bg-black/[0.04] focus-visible:outline-none"
                    href={request.whatsappUrl}
                    onClick={() => setOpen(false)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MessageCircle aria-hidden="true" size={18} />
                    {t('sciBrief.requestWhatsapp')}
                  </a>
                </li>
              </ul>
            )}
          </div>
          <p className="mt-3 text-xs text-secondary/60">{t('sciBrief.requestHint')}</p>
        </div>
      </div>
    </section>
  )
}
