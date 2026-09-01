import { Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TestimonialItem {
  content: string
  name: string
}
export function ClientStories() {
  const { t } = useTranslation()
  const testimonials = t('testimonials', { returnObjects: true }) as TestimonialItem[]

  return (
    <section className="bg-white px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.stories.title')}</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-secondary/65">{t('homepage.stories.description')}</p>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <figure className="flex min-h-80 flex-col justify-between rounded-[2rem] bg-[#f3ede3] p-7 sm:p-9" key={testimonial.name}>
              <Quote aria-hidden="true" className="text-primary" size={30} />
              <blockquote className="mt-10 text-lg leading-8 text-secondary/80">“{testimonial.content}”</blockquote>
              <figcaption className="mt-9 border-t border-secondary/10 pt-5 text-sm font-semibold text-secondary/55">{testimonial.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

