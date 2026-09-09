import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'

interface FaqItem {
  answer: string
  question: string
}
export function FrequentlyAskedQuestions() {
  const { t } = useTranslation()
  const managed = useLandingSection('frequentlyAskedQuestions')
  const reduceMotion = useReducedMotion()
  const items = managed
    ? [...managed.section.items]
      .sort((left, right) => left.position - right.position)
      .map((item) => ({ id: item.id, question: item.title[managed.locale], answer: item.description[managed.locale] }))
    : (t('homepage.faq.items', { returnObjects: true }) as FaqItem[]).map((item, index) => ({ ...item, id: `faq-${index}` }))
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="deferred-section bg-white px-5 py-24 lg:px-8 lg:py-32" id="faq">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <h2 className="max-w-lg text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-4xl">{managed?.section.headline[managed.locale] ?? t('homepage.faq.title')}</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-secondary/80">{managed?.section.description[managed.locale] ?? t('homepage.faq.description')}</p>
          <img alt="" className="mt-10 aspect-[538/410] w-full rounded-xl object-cover" height="410" loading="lazy" src="/images/figma/faq-room.webp" width="538" />
        </div>
        <div className="rounded-xl bg-[#fcf8f1] px-5 sm:px-7">
          {items.map((item, itemIndex) => {
            const isOpen = openIndex === itemIndex
            const panelId = `homepage-faq-panel-${itemIndex}`
            return (
              <div className="border-b border-secondary/15" key={item.id}>
                <motion.button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  id={`homepage-faq-question-${itemIndex}`}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:text-lg"
                  onClick={() => setOpenIndex(isOpen ? null : itemIndex)}
                  transition={INTERACTIVE_SPRING}
                  type="button"
                  whileHover={{ x: reduceMotion ? 0 : 4 }}
                >
                  {item.question}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eee5d8] text-secondary">
                    {isOpen ? <Minus aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
                  </span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      animate={{ height: 'auto', opacity: 1 }}
                      aria-labelledby={`homepage-faq-question-${itemIndex}`}
                      className="overflow-hidden"
                      exit={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
                      id={panelId}
                      initial={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
                      role="region"
                      transition={INTERACTIVE_SPRING}
                    >
                      <p className="max-w-3xl pb-7 pr-12 text-sm leading-7 text-secondary/80 sm:text-base">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
