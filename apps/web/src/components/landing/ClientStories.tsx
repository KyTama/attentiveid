import { motion } from 'framer-motion'
import { ArrowUpRight, ShieldCheck, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { contact } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'

interface TestimonialItem {
  content: string
  name: string
}
export function ClientStories() {
  const { t } = useTranslation()
  const managed = useLandingSection('clientStories')
  const testimonials = managed
    ? [...managed.section.items]
      .sort((left, right) => left.position - right.position)
      .map((item) => ({ id: item.id, name: item.title[managed.locale], content: item.description[managed.locale] }))
    : (t('testimonials', { returnObjects: true }) as TestimonialItem[]).map((item, index) => ({ ...item, id: `story-${index}` }))
  const title = managed?.section.headline[managed.locale] ?? t('homepage.stories.title')
  const description = managed?.section.description[managed.locale] ?? t('homepage.stories.description')

  // Repeat testimonials for seamless infinite marquee loop (bicarakan.id concept)
  const repeatCount = testimonials.length <= 3 ? 4 : 2
  const marqueeItems = Array.from({ length: repeatCount }, () => testimonials).flat()

  return (
    <section className="deferred-section bg-[#f3ede3] px-5 py-20 lg:px-8 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-16">
          <div>
            <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed font-[450] text-secondary sm:text-lg">{description}</p>
          </div>
          <div className="border-t border-primary/70 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="max-w-2xl text-base leading-relaxed font-[450] text-secondary">{t('homepage.stories.reviewPrompt')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 lg:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary" aria-label={t('homepage.stories.googleRating')}>
                <span className="flex gap-1 text-[#946a22]" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, starIndex) => <Star fill="currentColor" key={starIndex} size={16} />)}
                </span>
                {t('homepage.stories.googleRating')}
              </div>
              <motion.a
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-secondary px-6 py-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                href={contact.location.reviewsUrl}
                rel="noopener noreferrer"
                target="_blank"
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('homepage.stories.googleAction')}
                <ArrowUpRight aria-hidden="true" size={18} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Auto-moving Infinite Carousel (Concept inspired by bicarakan.id) */}
        <div className="mt-14 relative">
          <div className="mb-3 flex items-center justify-between text-xs text-secondary/60">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#946a22]">
              {t('homepage.stories.eyebrow', 'Ulasan & Pengalaman Klien')}
            </span>
            <span className="hidden sm:inline-block text-[11px]">
              {t('homepage.stories.pauseHint', '💡 Arahkan kursor / sentuh untuk menjeda ulasan')}
            </span>
          </div>

          {/* Horizontal Gradient Mask Container for soft fade edges */}
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_3%,white_97%,transparent)]">
            <div className="animate-marquee flex gap-5 py-3">
              {marqueeItems.map((testimonial, idx) => {
                const initials = (testimonial.name.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'KL').toUpperCase()
                return (
                  <figure
                    key={`${testimonial.id}-${idx}`}
                    className="w-[320px] sm:w-[380px] shrink-0 flex flex-col justify-between rounded-2xl border border-secondary/10 bg-white p-6 sm:p-7 shadow-2xs hover:shadow-lg transition-all select-none"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1 text-amber-500" aria-label="5 dari 5 bintang">
                          {Array.from({ length: 5 }, (_, starIndex) => (
                            <Star className="size-4 fill-amber-400 text-amber-400" key={starIndex} />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck className="size-3" />
                          <span>{t('homepage.stories.verified', 'Terverifikasi')}</span>
                        </span>
                      </div>
                      <blockquote className="mt-4 text-sm leading-relaxed text-secondary font-[450] line-clamp-6">
                        “{testimonial.content}”
                      </blockquote>
                    </div>

                    <figcaption className="mt-6 flex items-center gap-3 border-t border-secondary/10 pt-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-secondary">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-secondary">{testimonial.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {t('homepage.stories.confidential', 'Kerahasiaan Terikat Kode Etik')}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
