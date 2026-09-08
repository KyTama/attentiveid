import { motion } from 'framer-motion'
import { ArrowUpRight, Quote, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { contact } from '@/data/contact'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface TestimonialItem {
  content: string
  name: string
}
export function ClientStories() {
  const { t } = useTranslation()
  const testimonials = t('testimonials', { returnObjects: true }) as TestimonialItem[]

  return (
    <section className="deferred-section bg-[#f3ede3] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-16">
          <div>
            <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.stories.title')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-secondary/80">{t('homepage.stories.description')}</p>
          </div>
          <div className="border-t border-primary/70 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="max-w-2xl text-base leading-7 text-secondary/80">{t('homepage.stories.reviewPrompt')}</p>
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
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {testimonials[0] && (
            <figure className="flex min-h-[30rem] flex-col justify-between rounded-xl bg-secondary p-8 text-white sm:p-12">
              <Quote aria-hidden="true" className="text-primary" size={38} />
              <blockquote className="mt-12 max-w-2xl text-xl leading-9 text-white/90 sm:text-2xl sm:leading-10">“{testimonials[0].content}”</blockquote>
              <figcaption className="mt-10 border-t border-white/15 pt-6 text-sm font-semibold text-white/75">{testimonials[0].name}</figcaption>
            </figure>
          )}
          <div className="grid gap-5">
            {testimonials.slice(1, 3).map((testimonial) => (
              <figure className="flex flex-col justify-between rounded-xl bg-white/75 p-7 sm:p-9" key={testimonial.name}>
                <Quote aria-hidden="true" className="text-[#946a22]" size={26} />
                <blockquote className="mt-7 text-base leading-8 text-secondary/80">“{testimonial.content}”</blockquote>
                <figcaption className="mt-7 border-t border-secondary/10 pt-5 text-sm font-semibold text-secondary/70">{testimonial.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
