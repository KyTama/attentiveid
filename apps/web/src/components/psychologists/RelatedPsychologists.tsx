import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { PsychologistSummary } from '@/features/psychologists'
import { PsychologistDirectoryCard } from './PsychologistDirectoryCard'

interface RelatedPsychologistsProps {
  psychologists: PsychologistSummary[]
}

export function RelatedPsychologists({ psychologists }: RelatedPsychologistsProps) {
  const { t } = useTranslation()

  if (psychologists.length === 0) return null

  return (
    <section className="bg-white px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">
              {t('routes.profile.relatedTitle')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-secondary/65">
              {t('routes.profile.relatedDescription')}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-secondary underline decoration-primary underline-offset-8 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            to="/psychologists"
          >
            {t('routes.profile.viewDirectory')}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {psychologists.map((psychologist) => (
            <PsychologistDirectoryCard key={psychologist.slug} psychologist={psychologist} />
          ))}
        </ul>
      </div>
    </section>
  )
}
