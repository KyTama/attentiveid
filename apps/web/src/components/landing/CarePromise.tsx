import { useTranslation } from 'react-i18next'
import { UserRound } from 'lucide-react'

interface PromiseItem {
  description: string
  title: string
}
export function CarePromise() {
  const { t } = useTranslation()
  const items = t('homepage.promise.items', { returnObjects: true }) as PromiseItem[]

  return (
    <section className="relative overflow-hidden bg-secondary px-5 py-24 text-white lg:px-8 lg:py-28">
      <div className="absolute -right-28 top-10 size-96 rounded-full border border-primary/25" />
      <div className="absolute -right-14 top-24 size-72 rounded-full border border-primary/20" />
      <div className="relative mx-auto max-w-7xl">
        <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t('homepage.promise.title')}</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">{t('homepage.promise.description')}</p>
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, itemIndex) => (
            <li className="border-l border-primary/30 pl-6" key={item.title}>
              {itemIndex === 1 ? (
                <span aria-hidden="true" className="mb-5 grid size-16 place-items-center rounded-full border border-primary text-primary">
                  <UserRound size={34} strokeWidth={1.6} />
                </span>
              ) : (
                <img alt="" className="mb-5 size-16 object-contain" height="64" loading="lazy" src={`/images/figma/care-${itemIndex + 1}.webp`} width="64" />
              )}
              <span className="text-sm font-bold text-primary">0{itemIndex + 1}</span>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
