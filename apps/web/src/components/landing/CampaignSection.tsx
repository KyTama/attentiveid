import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarCheck2, Check, ClipboardCheck, Gift, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface CampaignItem {
  id: string
  badge: string
  title: string
  description: string
  perks: string[]
  cta: string
  href: string
  isFeatured?: boolean
  icon: typeof Gift
  accentColor: {
    badge: string
    iconBg: string
    iconColor: string
    border: string
    ctaBg: string
  }
}

export function CampaignSection() {
  const { t } = useTranslation()

  const campaigns: CampaignItem[] = [
    {
      id: 'free-session',
      badge: t('homepage.campaigns.freeSession.badge'),
      title: t('homepage.campaigns.freeSession.title'),
      description: t('homepage.campaigns.freeSession.description'),
      perks: t('homepage.campaigns.freeSession.perks', { returnObjects: true }) as string[],
      cta: t('homepage.campaigns.freeSession.cta'),
      href: 'https://attentive-free-session.page.gd/',
      isFeatured: true,
      icon: Gift,
      accentColor: {
        badge: 'bg-[#FAF0D7] text-[#8C6013] border-[#E9B949]/40',
        iconBg: 'bg-[#FBE8B5]',
        iconColor: 'text-[#8C6013]',
        border: 'border-[#E9B949]/50 shadow-md',
        ctaBg: 'bg-[#946A22] hover:bg-[#7D581A] text-white',
      },
    },
    {
      id: 'booking',
      badge: t('homepage.campaigns.booking.badge'),
      title: t('homepage.campaigns.booking.title'),
      description: t('homepage.campaigns.booking.description'),
      perks: t('homepage.campaigns.booking.perks', { returnObjects: true }) as string[],
      cta: t('homepage.campaigns.booking.cta'),
      href: 'https://booking.attentiveid.com/',
      icon: CalendarCheck2,
      accentColor: {
        badge: 'bg-secondary/10 text-secondary border-secondary/20',
        iconBg: 'bg-secondary/10',
        iconColor: 'text-secondary',
        border: 'border-secondary/15 hover:border-secondary/30 shadow-xs',
        ctaBg: 'bg-secondary hover:bg-secondary/90 text-white',
      },
    },
    {
      id: 'test-centre',
      badge: t('homepage.campaigns.testCentre.badge'),
      title: t('homepage.campaigns.testCentre.title'),
      description: t('homepage.campaigns.testCentre.description'),
      perks: t('homepage.campaigns.testCentre.perks', { returnObjects: true }) as string[],
      cta: t('homepage.campaigns.testCentre.cta'),
      href: 'https://attentive.portproject.my.id/',
      icon: ClipboardCheck,
      accentColor: {
        badge: 'bg-[#EBF3FB] text-[#1E568A] border-[#C8DFFA]',
        iconBg: 'bg-[#EBF3FB]',
        iconColor: 'text-[#1E568A]',
        border: 'border-secondary/15 hover:border-secondary/30 shadow-xs',
        ctaBg: 'bg-secondary hover:bg-secondary/90 text-white',
      },
    },
  ]

  return (
    <section className="relative border-b border-secondary/10 bg-[#faf6ee] px-5 py-16 sm:py-20 lg:px-8" id="campaigns">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8C6013] shadow-2xs backdrop-blur-xs">
            <Sparkles size={14} className="text-primary" />
            <span>{t('homepage.campaigns.eyebrow')}</span>
          </div>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl lg:text-5xl">
            {t('homepage.campaigns.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed font-[450] text-secondary/85 sm:text-lg">
            {t('homepage.campaigns.description')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((card) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-white p-7 sm:p-8 transition-colors ${card.accentColor.border}`}
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -4 }}
              >
                {card.isFeatured && (
                  <div className="absolute -top-3 right-6 rounded-full bg-[#946A22] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                    Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${card.accentColor.badge}`}
                    >
                      {card.badge}
                    </span>
                    <div className={`grid size-11 place-items-center rounded-xl ${card.accentColor.iconBg} ${card.accentColor.iconColor}`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-bold leading-snug text-secondary sm:text-2xl">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed font-[450] text-secondary/80 sm:text-base">
                    {card.description}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-secondary/10 pt-5">
                    {Array.isArray(card.perks) &&
                      card.perks.map((perk, perkIndex) => (
                        <li key={perkIndex} className="flex items-center gap-2.5 text-sm font-medium text-secondary">
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-[#8C6013]">
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <span>{perk}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-8 pt-2">
                  <motion.a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${card.title} - ${card.cta}`}
                    className={`inline-flex w-full items-center justify-center gap-2.5 rounded-lg px-5 py-3.5 text-sm font-semibold shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${card.accentColor.ctaBg}`}
                    transition={INTERACTIVE_SPRING}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{card.cta}</span>
                    <ArrowUpRight size={17} strokeWidth={2.4} />
                  </motion.a>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
