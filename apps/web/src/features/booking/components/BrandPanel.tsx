import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { BOOKING_TEXT, type BookingLang } from '../booking-i18n'

function AttentiveBrandMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="16" fill="#243766" />
      <circle cx="32" cy="32" r="20" stroke="#d8a74d" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="11" stroke="#e8d4a0" strokeWidth="1.75" opacity="0.85" />
      <circle cx="32" cy="32" r="4" fill="#d8a74d" />
    </svg>
  )
}

export function BrandPanel({ lang }: { lang: BookingLang }) {
  const t = BOOKING_TEXT[lang]
  return (
    <aside
      className="hidden lg:flex sticky top-0 h-screen flex-col justify-between overflow-hidden text-white p-10 xl:p-12 relative"
      style={{
        background:
          'radial-gradient(circle at 28% 18%, rgba(255,255,255,.05), transparent 16rem), radial-gradient(circle at 75% 72%, rgba(255,255,255,.035), transparent 18rem), #1c2b51',
      }}
    >
      <div
        className="absolute -left-[185px] -top-[45px] w-[340px] h-[150px] border-2 border-[#d8a74d] opacity-90 pointer-events-none"
        style={{ borderRadius: '55% 45% 48% 52% / 42% 50% 50% 58%', transform: 'rotate(-12deg)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-[175px] -bottom-[20px] w-[340px] h-[150px] border-2 border-[#d8a74d] opacity-90 pointer-events-none"
        style={{ borderRadius: '55% 45% 48% 52% / 42% 50% 50% 58%', transform: 'rotate(-8deg)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/75 hover:text-white mb-6 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#d8a74d] rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.backToHome}</span>
        </Link>

        <AttentiveBrandMark size={64} />
        <div className="text-[38px] leading-none font-extrabold tracking-[-1.8px] text-[#d8a74d] mt-4">
          attentive.
        </div>
        <div className="mt-2 text-[17px] italic text-white">We Focus on You</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={INTERACTIVE_SPRING}
        className="relative z-10 max-w-[340px]"
      >
        <span className="inline-block text-[#e8d4a0] uppercase tracking-[.16em] text-[11px] font-extrabold mb-3">
          {t.brandKicker}
        </span>
        <p className="text-[32px] leading-[1.17] font-semibold tracking-[-0.6px] mb-3.5">
          {t.brandTitle}
        </p>
        <p className="text-white/[.78] text-[14.5px] leading-[1.75]">{t.brandText}</p>
      </motion.div>

      <div className="relative z-10 text-white/[.62] text-xs leading-relaxed">
        <span>Biro Psikologi Attentive</span>
        <br />
        <span>{t.brandFooter}</span>
      </div>
    </aside>
  )
}

export function MobileBrand({ lang }: { lang: BookingLang }) {
  const t = BOOKING_TEXT[lang]
  return (
    <div className="lg:hidden -mx-4 sm:-mx-7 mb-6 overflow-hidden relative bg-[#1c2b51]">
      <div className="px-5 py-5 pb-6 relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AttentiveBrandMark size={40} />
          <div>
            <div className="text-[24px] font-extrabold text-[#d8a74d] tracking-[-1px] leading-none">
              attentive.
            </div>
            <div className="text-[11px] italic text-white/85 mt-0.5">We Focus on You</div>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-white/80 hover:text-white transition-colors rounded-lg px-2.5 py-1.5 bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.backToHome}</span>
        </Link>
      </div>
      <div
        className="absolute -right-[105px] -bottom-[32px] w-[210px] h-[90px] border-2 border-[#d8a74d] rounded-full pointer-events-none"
        style={{ transform: 'rotate(-10deg)' }}
        aria-hidden="true"
      />
    </div>
  )
}
