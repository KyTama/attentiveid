import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface FaqItem {
  answer: string
  question: string
}
export function FrequentlyAskedQuestions() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const items = t('homepage.faq.items', { returnObjects: true }) as FaqItem[]
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-white px-5 py-24 lg:px-8 lg:py-32" id="faq">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <h2 className="max-w-lg text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.faq.title')}</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-secondary/65">{t('homepage.faq.description')}</p>
        </div>
        <div className="border-t border-secondary/15">
          {items.map((item, itemIndex) => {
            const isOpen = openIndex === itemIndex
            const panelId = `homepage-faq-panel-${itemIndex}`
            return (
              <div className="border-b border-secondary/15" key={item.question}>
                <motion.button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
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
                      exit={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
                      id={panelId}
                      initial={{ height: 0, opacity: reduceMotion ? 1 : 0 }}
                      role="region"
                      transition={INTERACTIVE_SPRING}
                    >
                      <p className="max-w-3xl pb-7 pr-12 text-sm leading-7 text-secondary/65 sm:text-base">{item.answer}</p>
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

