import { CalendarCheck2, ClipboardCheck, Gift, MessageCircle, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'
import type { FeaturedCardIcon, FeaturedCardTheme } from '@attentiveid/shared'

/** Look of each card theme in the homepage "Featured Campaigns & Portals" strip. */
export interface CardThemeStyle {
  card: string
  badge: string
  iconBox: string
  titleHover: string
  footer: string
}

export const CARD_THEME_STYLES: Record<FeaturedCardTheme, CardThemeStyle> = {
  gold: {
    card: 'border-primary/50 bg-gradient-to-b from-white to-[#FDF8EE] hover:border-primary',
    badge: 'bg-[#FAF0D7] text-[#8C6013]',
    iconBox: 'bg-[#FAF0D7] text-[#8C6013]',
    titleHover: 'group-hover:text-[#8C6013]',
    footer: 'border-[#E9B949]/20 text-[#8C6013]',
  },
  navy: {
    card: 'border-secondary/15 bg-white hover:border-secondary/35',
    badge: 'bg-secondary/10 text-secondary',
    iconBox: 'bg-secondary/10 text-secondary',
    titleHover: 'group-hover:text-primary',
    footer: 'border-secondary/10 text-secondary group-hover:text-primary',
  },
  blue: {
    card: 'border-secondary/15 bg-white hover:border-secondary/35',
    badge: 'bg-[#EBF3FB] text-[#1E568A]',
    iconBox: 'bg-[#EBF3FB] text-[#1E568A]',
    titleHover: 'group-hover:text-[#1E568A]',
    footer: 'border-secondary/10 text-[#1E568A]',
  },
  emerald: {
    card: 'border-emerald-600/20 bg-white hover:border-emerald-600/40',
    badge: 'bg-emerald-50 text-emerald-800',
    iconBox: 'bg-emerald-50 text-emerald-800',
    titleHover: 'group-hover:text-emerald-800',
    footer: 'border-secondary/10 text-emerald-800',
  },
}

export const CARD_ICONS: Record<FeaturedCardIcon, LucideIcon> = {
  gift: Gift,
  calendar: CalendarCheck2,
  clipboard: ClipboardCheck,
  sparkles: Sparkles,
  shield: ShieldCheck,
  message: MessageCircle,
}

export const CARD_THEME_LABELS: Record<FeaturedCardTheme, string> = {
  gold: 'Emas (kartu promo)',
  navy: 'Navy',
  blue: 'Biru muda',
  emerald: 'Hijau',
}

export const CARD_ICON_LABELS: Record<FeaturedCardIcon, string> = {
  gift: 'Hadiah',
  calendar: 'Kalender',
  clipboard: 'Papan asesmen',
  sparkles: 'Kilau',
  shield: 'Perisai',
  message: 'Pesan',
}
