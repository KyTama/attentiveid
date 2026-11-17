import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export interface ServiceTopbarProps {
  locale: 'id' | 'en'
  onLocaleChange: (locale: 'id' | 'en') => void
  onOpenAssistant?: () => void
  activeRoute?: 'catalog' | 'detail' | 'demo'
  showInternalToggle?: boolean
  internalPreviewMode?: boolean
  onToggleInternalPreview?: () => void
}

export function ServiceTopbar({
  locale,
  onLocaleChange,
  onOpenAssistant,
  activeRoute = 'catalog',
  showInternalToggle = false,
  internalPreviewMode = false,
  onToggleInternalPreview,
}: ServiceTopbarProps) {
  const isEn = locale === 'en'

  return (
    <header className="sticky top-0 z-50 bg-[#142b51] text-[#f5edd4] shadow-[0_6px_22px_rgba(13,31,61,0.18)]">
      <div className="mx-auto flex min-h-16 max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
          >
            <img
              src="/images/figma/attentive-logo.webp"
              alt="Attentive.id"
              width={528}
              height={144}
              className="h-7 w-auto"
            />
            <span className="hidden border-l border-[#f5edd4]/25 pl-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5edd4]/75 sm:inline">
              {isEn ? 'Services Catalog' : 'Katalog Layanan'}
            </span>
          </Link>

          <nav aria-label={isEn ? 'Services navigation' : 'Navigasi layanan'} className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#f5edd4]/80 transition-colors hover:bg-[#f5edd4]/10 hover:text-[#f5edd4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'Home' : 'Beranda'}</span>
            </Link>
            <Link
              to="/services"
              aria-current={activeRoute === 'catalog' ? 'page' : undefined}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d] ${
                activeRoute === 'catalog'
                  ? 'bg-[#d6a74d] font-bold text-[#142b51]'
                  : 'font-medium text-[#f5edd4]/85 hover:bg-[#f5edd4]/10 hover:text-[#f5edd4]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'All Services' : 'Semua Layanan'}</span>
            </Link>
            <Link
              to="/services/demo"
              aria-current={activeRoute === 'demo' ? 'page' : undefined}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d] ${
                activeRoute === 'demo'
                  ? 'bg-[#d6a74d] font-bold text-[#142b51]'
                  : 'font-medium text-[#f5edd4]/85 hover:bg-[#f5edd4]/10 hover:text-[#f5edd4]'
              }`}
            >
              <Brain className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'Cognitive Demo' : 'Demo Kognitif'}</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {showInternalToggle && onToggleInternalPreview && (
            <button
              type="button"
              onClick={onToggleInternalPreview}
              aria-pressed={internalPreviewMode}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                internalPreviewMode
                  ? 'border-amber-300 bg-amber-300 text-[#142b51]'
                  : 'border-[#f5edd4]/30 bg-[#0d1f3d] text-[#f5edd4] hover:border-[#d6a74d]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {internalPreviewMode
                  ? isEn
                    ? 'Internal Demo ON (53 + Costs)'
                    : 'Mode Internal ON (53 + Biaya)'
                  : isEn
                    ? 'Internal Demo OFF'
                    : 'Mode Demo Internal'}
              </span>
            </button>
          )}
          {onOpenAssistant && (
            <motion.button
              type="button"
              onClick={onOpenAssistant}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={INTERACTIVE_SPRING}
              className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-[#d6a74d] px-3.5 py-2 text-[12.5px] font-bold text-[#142b51] shadow-xs hover:bg-[#e1b55d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5edd4]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{isEn ? 'Help Me Choose' : 'Bantu Pilih Layanan'}</span>
            </motion.button>
          )}

          <div
            role="group"
            aria-label={isEn ? 'Language switcher' : 'Pemilih bahasa'}
            className="inline-flex items-center gap-0.5 rounded-full border border-[#f5edd4]/20 bg-[#0d1f3d] p-0.5 text-[11px] font-bold"
          >
            <button
              type="button"
              onClick={() => onLocaleChange('id')}
              className={`min-h-8 min-w-8 cursor-pointer rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d] ${
                locale === 'id' ? 'bg-[#d6a74d] text-[#142b51]' : 'text-[#f5edd4]/75 hover:text-[#f5edd4]'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange('en')}
              className={`min-h-8 min-w-8 cursor-pointer rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d] ${
                locale === 'en' ? 'bg-[#d6a74d] text-[#142b51]' : 'text-[#f5edd4]/75 hover:text-[#f5edd4]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
