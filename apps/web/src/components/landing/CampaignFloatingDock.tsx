import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, CalendarCheck2, ClipboardCheck, Gift, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'
import { useCampaignDock } from './use-campaign-dock'

export function CampaignFloatingDock() {
  const { t, i18n } = useTranslation()
  const { isOpen } = useIntakeModal()
  const { isDismissed, dismissDock } = useCampaignDock()
  const isId = i18n.resolvedLanguage === 'id'

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.aside
          aria-label={t('homepage.campaigns.eyebrow')}
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
            {/* Item 1: Free Session */}
            <motion.a
              href="https://free-session.attentiveid.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.freeSession.title')} - ${t('homepage.campaigns.freeSession.cta')}`}
              className="group flex h-full items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 text-[11px] font-bold text-secondary shadow-2xs outline-none hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-3 sm:text-xs"
              transition={INTERACTIVE_SPRING}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <Gift size={12} strokeWidth={2.5} className="shrink-0 text-secondary" />
              <span className="leading-none">{isId ? 'Sesi Gratis' : 'Free Session'}</span>
              <ArrowUpRight size={11} strokeWidth={2.6} className="hidden shrink-0 opacity-70 group-hover:opacity-100 sm:inline-block" />
            </motion.a>

            {/* Separator */}
            <div aria-hidden="true" className="mx-0.5 h-3 w-px bg-white/20" />

            {/* Item 2: Booking */}
            <motion.a
              href="https://booking.attentiveid.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.booking.title')} - ${t('homepage.campaigns.booking.cta')}`}
              className="group flex h-full items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-medium text-white/90 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-2.5 sm:text-xs"
              transition={INTERACTIVE_SPRING}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <CalendarCheck2 size={12} strokeWidth={2.2} className="shrink-0 text-white/75 group-hover:text-white" />
              <span className="leading-none">{isId ? 'Booking' : 'Book Session'}</span>
              <ArrowUpRight size={11} strokeWidth={2.4} className="hidden shrink-0 opacity-50 group-hover:opacity-100 sm:inline-block" />
            </motion.a>

            {/* Separator */}
            <div aria-hidden="true" className="mx-0.5 h-3 w-px bg-white/20" />

            {/* Item 3: Test Centre */}
            <motion.a
              href="https://assessment.attentiveid.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.testCentre.title')} - ${t('homepage.campaigns.testCentre.cta')}`}
              className="group flex h-full items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-medium text-white/90 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:gap-1.5 sm:px-2.5 sm:text-xs"
              transition={INTERACTIVE_SPRING}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <ClipboardCheck size={12} strokeWidth={2.2} className="shrink-0 text-white/75 group-hover:text-white" />
              <span className="leading-none">{isId ? 'Tes Online' : 'Test Centre'}</span>
              <ArrowUpRight size={11} strokeWidth={2.4} className="hidden shrink-0 opacity-50 group-hover:opacity-100 sm:inline-block" />
            </motion.a>

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
