import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarCheck2,
  ClipboardCheck,
  Gift,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useCampaignDock } from './use-campaign-dock'

export function CampaignFloatingDock() {
  const { t, i18n } = useTranslation()
  const { isOpen } = useIntakeModal()
  const { isDismissed, dismissDock } = useCampaignDock()
  const isId = i18n.resolvedLanguage === 'id' || i18n.language === 'id'
  const managed = useLandingSection('hero')
  const localeKey = managed?.locale || (isId ? 'id' : 'en')
  const customCampaigns = (managed?.section as any)?.campaigns

  type DockCardItem = {
    id: string
    visible: boolean
    theme: 'gold' | 'navy' | 'blue' | 'emerald'
    icon: 'gift' | 'calendar' | 'clipboard' | 'sparkles' | 'shield' | 'message'
    shortLabel: string
    title: string
    cta: string
    url: string
  }

  const defaultDockItems: DockCardItem[] = [
    {
      id: 'card-free-session',
      visible: true,
      theme: 'gold',
      icon: 'gift',
      shortLabel: isId ? 'Sesi Gratis' : 'Free Session',
      title: t('homepage.campaigns.freeSession.title'),
      cta: t('homepage.campaigns.freeSession.cta'),
      url: 'https://free-session.attentiveid.com',
    },
    {
      id: 'card-booking',
      visible: true,
      theme: 'navy',
      icon: 'calendar',
      shortLabel: isId ? 'Booking' : 'Book Session',
      title: t('homepage.campaigns.booking.title'),
      cta: t('homepage.campaigns.booking.cta'),
      url: 'https://booking.attentiveid.com/',
    },
  ]

  const defaultThemes = ['gold', 'navy', 'blue', 'emerald'] as const
  const defaultIcons = ['gift', 'calendar', 'clipboard', 'sparkles'] as const

  const resolvedDockItems: DockCardItem[] = Array.isArray(customCampaigns?.cards)
    ? customCampaigns.cards.map((card: any, idx: number) => {
        const fallback = defaultDockItems[idx]
        const badgeText = card.badge?.[localeKey] || card.badge?.id || ''
        const titleText = card.title?.[localeKey] || card.title?.id || fallback?.title || ''
        const ctaText = card.cta?.[localeKey] || card.cta?.id || fallback?.cta || ''
        const resolvedUrl = card.url || fallback?.url || '#'
        return {
          id: card.id || `dock-card-${idx}`,
          visible: card.visible !== false && !resolvedUrl.includes('assessment.attentiveid.com'),
          theme: (card.theme || defaultThemes[idx % defaultThemes.length]) as 'gold' | 'navy' | 'blue' | 'emerald',
          icon: (card.icon || defaultIcons[idx % defaultIcons.length]) as
            | 'gift'
            | 'calendar'
            | 'clipboard'
            | 'sparkles'
            | 'shield'
            | 'message',
          shortLabel: badgeText || fallback?.shortLabel || titleText,
          title: titleText,
          cta: ctaText,
          url: resolvedUrl,
        }
      })
    : defaultDockItems

  const visibleDockItems = resolvedDockItems.filter((item) => item.visible)
  const shouldShowDock =
    !isDismissed &&
    customCampaigns?.visible !== false &&
    customCampaigns?.showFloatingDock !== false &&
    visibleDockItems.length > 0

  return (
    <AnimatePresence>
      {shouldShowDock && (
        <motion.aside
          aria-label={customCampaigns?.eyebrow?.[localeKey] || t('homepage.campaigns.eyebrow')}
          className="fixed bottom-3.5 left-1/2 z-40 -translate-x-1/2 px-2 sm:bottom-5"
          initial={{ y: 60, opacity: 0 }}
          animate={{
            y: isOpen ? 100 : 0,
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
          exit={{ y: 60, opacity: 0 }}
          transition={INTERACTIVE_SPRING}
        >
          {/* Ultra-Slim Micro Capsule (34px height) */}
          <div className="flex h-8.5 sm:h-9.5 items-center gap-0.5 rounded-full border border-white/20 bg-secondary/95 p-1 shadow-xl backdrop-blur-xl sm:gap-1 sm:p-1.5">
            {visibleDockItems.map((item, idx) => {
              const IconComponent =
                item.icon === 'gift'
                  ? Gift
                  : item.icon === 'calendar'
                  ? CalendarCheck2
                  : item.icon === 'clipboard'
                  ? ClipboardCheck
                  : item.icon === 'shield'
                  ? ShieldCheck
                  : item.icon === 'message'
                  ? MessageCircle
                  : Sparkles

              const isHighlight = item.theme === 'gold' || idx === 0

              return (
                <Fragment key={item.id}>
                  {idx > 0 && <div aria-hidden="true" className="mx-0.5 h-3 w-px bg-white/20" />}
                  <motion.a
                    href={item.url}
                    target={item.url.startsWith('http') ? '_blank' : undefined}
                    rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={`${item.title} - ${item.cta}`}
                    className={
                      isHighlight
                        ? 'group flex h-full items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 text-[11px] font-bold text-secondary shadow-2xs outline-none hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-3 sm:text-xs'
                        : 'group flex h-full items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-medium text-white/90 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-2.5 sm:text-xs'
                    }
                    transition={INTERACTIVE_SPRING}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <IconComponent
                      size={12}
                      strokeWidth={isHighlight ? 2.5 : 2.2}
                      className={
                        isHighlight
                          ? 'shrink-0 text-secondary'
                          : 'shrink-0 text-white/75 group-hover:text-white'
                      }
                    />
                    <span className="leading-none">{item.shortLabel}</span>
                    <ArrowUpRight
                      size={11}
                      strokeWidth={isHighlight ? 2.6 : 2.4}
                      className="hidden shrink-0 opacity-70 group-hover:opacity-100 sm:inline-block"
                    />
                  </motion.a>
                </Fragment>
              )
            })}

            {/* Dismiss Button */}
            <div aria-hidden="true" className="mx-0.5 h-3 w-px bg-white/20" />
            <motion.button
              type="button"
              onClick={dismissDock}
              aria-label={isId ? 'Tutup navigasi cepat' : 'Close quick bar'}
              className="grid size-5.5 sm:size-6 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/15 hover:text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
              transition={INTERACTIVE_SPRING}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={11} strokeWidth={2.4} />
            </motion.button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
