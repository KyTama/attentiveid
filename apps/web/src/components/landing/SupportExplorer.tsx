import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface SupportTopic {
  description: string
  id: string
  title: string
}

export function SupportExplorer() {
  const { t } = useTranslation()
  const topics = t('homepage.support.topics', { returnObjects: true }) as SupportTopic[]

  return (
    <section className="deferred-section px-5 py-20 lg:px-8 lg:py-28" id="support">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl">{t('homepage.support.title')}</h2>
          <p className="mt-5 text-base leading-7 text-secondary/75">{t('homepage.support.description')}</p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic, topicIndex) => (
            <motion.li className="relative flex min-h-80 overflow-hidden rounded-xl bg-[#f5efe5]" key={topic.id} transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }}>
              <div className="relative z-10 flex w-[64%] flex-col p-5 sm:p-6">
                <img alt="" className="size-10 object-contain" height="40" loading="lazy" src={`/images/figma/support-icon-${topicIndex + 1}.webp`} width="40" />
                <h3 className="mt-5 text-lg font-bold leading-6 text-secondary">{topic.title}</h3>
                <p className="mt-4 text-sm leading-6 text-secondary/80">{topic.description}</p>
                <Link className="mt-auto inline-flex min-h-11 items-center pt-5 text-xs font-semibold text-secondary underline decoration-primary underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/psychologists">
                  {t('homepage.support.action')}
                  <span className="sr-only">: {topic.title}</span>
                </Link>
              </div>
              <img alt="" className="absolute right-0 top-0 h-full w-[38%] object-cover" height="388" loading="lazy" src={`/images/figma/support-${topicIndex + 1}.webp`} width="169" />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
