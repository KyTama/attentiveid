import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'
import { useSiteSettings } from '@/features/site-settings/use-site-settings'
import { FloatingBarView } from './FloatingBarView'
import { useCampaignDock } from './use-campaign-dock'

/**
 * Floating quick bar at the bottom of the homepage. Its buttons, the round badge on top and whether it
 * shows at all are set in the portal (Pengaturan Situs); visitors can still close it.
 */
export function CampaignFloatingDock() {
  const { i18n } = useTranslation()
  const { isOpen } = useIntakeModal()
  const { isDismissed, dismissDock } = useCampaignDock()
  const { floatingBar } = useSiteSettings()
  const isId = !(i18n.resolvedLanguage || i18n.language || 'id').startsWith('en')

  const hasContent = floatingBar.items.some((item) => item.visible) || floatingBar.top.visible
  const shouldShowDock = !isDismissed && floatingBar.visible && hasContent

  return (
    <AnimatePresence>
      {shouldShowDock && (
        <motion.aside
          aria-label={isId ? 'Navigasi cepat' : 'Quick links'}
          className="fixed bottom-3.5 left-1/2 z-40 -translate-x-1/2 px-2 pt-4 sm:bottom-5"
          initial={{ y: 60, opacity: 0 }}
          animate={{
            y: isOpen ? 100 : 0,
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
          exit={{ y: 60, opacity: 0 }}
          transition={INTERACTIVE_SPRING}
        >
          <FloatingBarView
            dismissLabel={isId ? 'Tutup navigasi cepat' : 'Close quick bar'}
            isId={isId}
            onDismiss={dismissDock}
            settings={floatingBar}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
