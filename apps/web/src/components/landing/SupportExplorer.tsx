import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useIntakeModal } from '@/components/intake'
import type { IntakeConcernId } from '@attentiveid/shared'

const topicToIntakeConcern: Record<string, IntakeConcernId> = {
  adult: 'anxiety_mood',
  relationships: 'relationship_family',
  child: 'child_adolescent',
  family: 'relationship_family',
  assessment: 'general_assessment',
  career: 'career_burnout',
}

const topicToDirectoryQuery: Record<string, { en: string; id: string }> = {
  adult: { en: '/psychologists?support=adultClinical', id: '/psychologists?support=adultClinical' },
  relationships: { en: '/psychologists?q=relationship', id: '/psychologists?q=relasi' },
  child: { en: '/psychologists?support=childAdolescent', id: '/psychologists?support=childAdolescent' },
  family: { en: '/psychologists?q=family', id: '/psychologists?q=keluarga' },
  assessment: { en: '/psychologists?support=educational', id: '/psychologists?support=educational' },
  career: { en: '/psychologists?q=career', id: '/psychologists?q=karir' },
}

interface SupportTopic {
  description: string
  id: string
  title: string
}

export function SupportExplorer() {
  const { i18n, t } = useTranslation()
  const locale = i18n.resolvedLanguage === 'id' ? 'id' : 'en'
  const { openIntake } = useIntakeModal()
  const managed = useLandingSection('supportExplorer')
  const topics = managed
    ? [...managed.section.items]
      .sort((left, right) => left.position - right.position)
      .map((item) => ({ id: item.id, title: item.title[managed.locale], description: item.description[managed.locale] }))
    : t('homepage.support.topics', { returnObjects: true }) as SupportTopic[]
  const title = managed?.section.headline[managed.locale] ?? t('homepage.support.title')
  const description = managed?.section.description[managed.locale] ?? t('homepage.support.description')

  return (
    <section className="deferred-section px-5 py-20 lg:px-8 lg:py-28" id="support">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed font-[450] text-secondary sm:text-lg">{description}</p>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {topics.map((topic, topicIndex) => (
            <motion.li
              className="group relative flex flex-col sm:flex-row min-h-[300px] overflow-hidden rounded-2xl border border-secondary/10 bg-[#f5efe5] shadow-xs"
              key={topic.id}
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
            >
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <img
                    alt=""
                    className="size-9 object-contain"
                    height="36"
                    loading="lazy"
                    src={`/images/figma/support-icon-${topicIndex + 1}.webp`}
                    width="36"
                  />
                  <h3 className="mt-4 text-xl font-bold leading-snug text-secondary">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed font-[450] text-secondary/85">{topic.description}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-secondary/10 pt-4">
                  <button
                    type="button"
                    onClick={() => openIntake({ concernId: topicToIntakeConcern[topic.id] || 'anxiety_mood' })}
                    className="inline-flex min-h-11 items-center text-xs font-bold text-secondary underline decoration-primary underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  >
                    {t('intakeDialog.title')}
                  </button>
                  <Link
                    className="inline-flex min-h-11 items-center text-xs font-bold text-secondary/90 hover:text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    to={topicToDirectoryQuery[topic.id]?.[locale] ?? '/psychologists'}
                  >
                    {t('homepage.support.action')}
                    <span className="sr-only">: {topic.title}</span>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-4/3 w-full sm:aspect-auto sm:w-[48%] overflow-hidden bg-secondary/5">
                <img
                  alt={topic.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  height="400"
                  loading="lazy"
                  src={`/images/figma/support-${topicIndex + 1}.webp`}
                  width="600"
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
