import { useEffect } from 'react'
import { ArrowRight, Clock } from 'lucide-react'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { useTx } from '@/features/i18n/use-tx'

interface AssessmentCard {
  id: string
  title: string
  tag: string
  body: string
  minutes: string
  /** A normal link (full page load): the form is its own page, not part of the single-page app. */
  href: string | null
}

/** /assessments — the assessments people can take on the site. */
export function AssessmentsPage() {
  const { tx } = useTx()

  useEffect(() => {
    const previous = document.title
    document.title = `${tx('Asesmen', 'Assessments')} — Attentive.id`
    return () => {
      document.title = previous
    }
  }, [tx])

  const cards: AssessmentCard[] = [
    {
      id: 'mhcu',
      title: 'Mental Health Check-Up (MHCU)',
      tag: tx('Skrining kesehatan mental', 'Mental health screening'),
      body: tx(
        'Gambaran umum kondisi kesehatan mental Anda: gejala dua minggu terakhir, kesejahteraan, dan kebiasaan sehari-hari. Hasil ditinjau psikolog Attentive.',
        'A general picture of your mental health: symptoms over the past two weeks, wellbeing and daily habits. A psychologist at Attentive reviews the result.',
      ),
      minutes: tx('± 15–20 menit', '± 15–20 minutes'),
      href: '/assessments/mhcu',
    },
    {
      id: 'gsc',
      title: 'Goal System Compass (GSC)',
      tag: tx('Peta tujuan hidup', 'Life goals map'),
      body: tx(
        'Memetakan tujuan-tujuan Anda, mana yang saling mendukung dan mana yang saling bertabrakan, lalu dibahas bersama konselor.',
        'Maps your goals, which ones support each other and which ones clash, then talk it through with a counselor.',
      ),
      minutes: tx('± 20–30 menit', '± 20–30 minutes'),
      href: null,
    },
  ]

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary/60">{tx('Asesmen', 'Assessments')}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" data-route-heading tabIndex={-1}>
          {tx('Kenali diri Anda lebih baik', 'Get to know yourself better')}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-secondary/75">
          {tx(
            'Asesmen berikut dikembangkan Attentive Psychology Bureau. Jawaban Anda bersifat rahasia dan hanya dapat dibaca tim psikolog kami.',
            'These assessments are developed by Attentive Psychology Bureau. Your answers are confidential and only our team of psychologists can read them.',
          )}
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((card) => (
            <li className="flex flex-col rounded-2xl border border-secondary/10 bg-white p-6 shadow-sm" key={card.id}>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary/55">{card.tag}</span>
              <h2 className="mt-2 text-xl font-bold">{card.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary/75">{card.body}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-secondary/60">
                  <Clock aria-hidden="true" className="size-3.5" />
                  {card.minutes}
                </span>
                {card.href ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={card.href}
                  >
                    {tx('Mulai', 'Start')}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                ) : (
                  <span className="rounded-full border border-secondary/15 px-3 py-1.5 text-xs font-semibold text-secondary/60">
                    {tx('Segera hadir', 'Coming soon')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-secondary/55">
          {tx(
            'Asesmen ini adalah skrining, bukan diagnosis. Bila Anda merasa dalam krisis, hubungi layanan darurat setempat atau hubungi kami segera.',
            'These assessments are screenings, not a diagnosis. If you feel in crisis, contact your local emergency service or reach out to us right away.',
          )}
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
