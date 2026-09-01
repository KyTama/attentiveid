import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Baby,
  Brain,
  BriefcaseBusiness,
  ClipboardCheck,
  HeartHandshake,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface SupportTopic {
  description: string
  id: 'adult' | 'relationships' | 'child' | 'family' | 'assessment' | 'career'
  title: string
}
const topicIcons = {
  adult: Brain,
  relationships: HeartHandshake,
  child: Baby,
  family: Users,
  assessment: ClipboardCheck,
  career: BriefcaseBusiness,
} as const

export function SupportExplorer() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const topics = t('homepage.support.topics', { returnObjects: true }) as SupportTopic[]
  const [activeTopicId, setActiveTopicId] = useState<SupportTopic['id']>('adult')
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? topics[0]

  return (
    <section className="px-5 py-24 lg:px-8 lg:py-32" id="support">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <h2 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-secondary sm:text-5xl">
              {t('homepage.support.title')}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-secondary/65">{t('homepage.support.description')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topicIcons[topic.id]
              const active = topic.id === activeTopicId
              return (
                <motion.button
                  aria-pressed={active}
                  className={active
                    ? 'flex min-h-28 flex-col justify-between rounded-2xl bg-secondary p-4 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                    : 'flex min-h-28 flex-col justify-between rounded-2xl border border-secondary/15 bg-white/55 p-4 text-left text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  transition={INTERACTIVE_SPRING}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon aria-hidden="true" className={active ? 'text-primary' : 'text-secondary/55'} size={21} />
                  <span className="mt-5 text-sm font-semibold leading-5">{topic.title}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 min-h-64 overflow-hidden rounded-[2rem] bg-[#eee5d8] p-7 sm:p-10">
          <AnimatePresence mode="wait">
            {activeTopic && (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end"
                exit={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -18 }}
                initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 18 }}
                key={activeTopic.id}
                transition={INTERACTIVE_SPRING}
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">{t('homepage.support.selectedLabel')}</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-secondary sm:text-4xl">{activeTopic.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-secondary/65">{activeTopic.description}</p>
                </div>
                <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    className="inline-flex rounded-full bg-primary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                    to="/psychologists"
                  >
                    {t('homepage.support.action')}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

