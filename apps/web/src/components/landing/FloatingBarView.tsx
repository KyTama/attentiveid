import { motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { Fragment } from 'react'
import type { FloatingBarSettings } from '@attentiveid/shared'
import { CARD_ICONS } from '@/features/featured/card-style'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface FloatingBarViewProps {
  settings: FloatingBarSettings
  isId: boolean
  onDismiss?: () => void
  dismissLabel?: string
  /** Preview inside the portal: no hover motion, links do nothing. */
  preview?: boolean
}

const external = (url: string) => /^https?:\/\//.test(url)

function LinkOrSpan({
  url,
  preview,
  className,
  label,
  children,
}: {
  url: string
  preview?: boolean
  className: string
  label: string
  children: React.ReactNode
}) {
  if (!url || preview) {
    return (
      <span aria-label={label} className={className} role={preview ? undefined : 'img'}>
        {children}
      </span>
    )
  }
  return (
    <motion.a
      aria-label={label}
      className={className}
      href={url}
      rel={external(url) ? 'noopener noreferrer' : undefined}
      target={external(url) ? '_blank' : undefined}
      transition={INTERACTIVE_SPRING}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.a>
  )
}

/**
 * The quick bar: three buttons in a pill with a small round badge (the lights logo, or a text link with
 * an icon) rising out of the top centre. Everything comes from the portal settings.
 */
export function FloatingBarView({ settings, isId, onDismiss, dismissLabel, preview = false }: FloatingBarViewProps) {
  const pick = (value: { id: string; en: string }) => (isId ? value.id || value.en : value.en || value.id)
  const items = settings.items.filter((item) => item.visible)
  const top = settings.top
  const TopIcon = CARD_ICONS[top.icon]

  return (
    <div className="relative mx-auto w-max max-w-[calc(100vw-1rem)]">
      {top.visible && (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[74%]">
          {top.mode === 'image' && top.imageUrl ? (
            <LinkOrSpan
              className="grid size-10 place-items-center rounded-full border-[3px] border-[#FAF8F3] bg-secondary shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
              label={pick(top.label)}
              preview={preview}
              url={top.url}
            >
              <img alt="" className="floating-bar-star size-7 object-contain" height={28} src={top.imageUrl} width={28} />
            </LinkOrSpan>
          ) : (
            <LinkOrSpan
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[3px] border-[#FAF8F3] bg-secondary px-3.5 py-1.5 text-xs font-bold text-primary shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
              label={pick(top.label)}
              preview={preview}
              url={top.url}
            >
              <TopIcon aria-hidden="true" size={14} strokeWidth={2.4} />
              <span>{pick(top.label)}</span>
              {top.url && !preview && <ArrowUpRight aria-hidden="true" size={12} strokeWidth={2.6} className="opacity-75" />}
            </LinkOrSpan>
          )}
        </div>
      )}

      <div className="flex items-stretch gap-0.5 rounded-full border border-white/20 bg-secondary/95 px-1.5 pb-1.5 pt-2.5 shadow-xl backdrop-blur-xl sm:gap-1 sm:px-2 sm:pb-2 sm:pt-3">
        {items.map((item, index) => {
          const Icon = CARD_ICONS[item.icon]
          return (
            <Fragment key={item.id}>
              {index > 0 && <div aria-hidden="true" className="my-1.5 w-px bg-white/20" />}
              <LinkOrSpan
                className={
                  item.highlight
                    ? 'group flex min-w-0 items-center justify-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-center text-[10.5px] font-bold leading-tight text-secondary shadow-2xs outline-none hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-3.5 sm:text-xs'
                    : 'group flex min-w-0 items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-center text-[10.5px] font-medium leading-tight text-white/90 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-3 sm:text-xs'
                }
                label={pick(item.label)}
                preview={preview}
                url={item.url}
              >
                <Icon aria-hidden="true" className="shrink-0" size={13} strokeWidth={item.highlight ? 2.5 : 2.2} />
                <span>{pick(item.label)}</span>
                {item.url && !preview && (
                  <ArrowUpRight aria-hidden="true" className="hidden shrink-0 opacity-70 group-hover:opacity-100 sm:inline-block" size={11} strokeWidth={2.4} />
                )}
              </LinkOrSpan>
            </Fragment>
          )
        })}
      </div>

      {onDismiss && (
        <motion.button
          aria-label={dismissLabel}
          className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-white/20 bg-secondary text-white/70 shadow-md outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          onClick={onDismiss}
          transition={INTERACTIVE_SPRING}
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X aria-hidden="true" size={11} strokeWidth={2.4} />
        </motion.button>
      )}
    </div>
  )
}
