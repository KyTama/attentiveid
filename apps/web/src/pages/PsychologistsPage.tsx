import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { listPsychologists, type PsychologistListState } from '@/features/psychologists'
import { PsychologistDirectory } from '@/components/psychologists/PsychologistDirectory'

export function LegacyPsychologistsPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<PsychologistListState>({ status: 'loading' })

  useEffect(() => {
    let isActive = true

    listPsychologists()
      .then((result) => {
        if (isActive) setState(result)
      })
      .catch(() => {
        if (isActive) setState({ status: 'error' })
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-dominant px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Link className="font-medium text-secondary underline underline-offset-4" to="/">
          {t('routes.common.home')}
        </Link>
        <h1
          className="mt-8 max-w-3xl font-sans text-4xl font-semibold text-secondary outline-none md:text-6xl"
          data-route-heading
          tabIndex={-1}
        >
          {t('routes.psychologists.title')}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          {t('routes.psychologists.description')}
        </p>

        <section className="mt-12" aria-busy={state.status === 'loading'} aria-live="polite">
          {state.status === 'loading' && <p>{t('routes.common.loading')}</p>}
          {state.status === 'error' && <p>{t('routes.common.error')}</p>}
          {state.status === 'empty' && <p>{t('routes.psychologists.empty')}</p>}
          {state.status === 'success' && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {state.psychologists.map((psychologist) => (
                <li key={psychologist.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img
                    alt={psychologist.name}
                    className="aspect-[4/3] w-full object-cover object-top"
                    decoding="async"
                    height="360"
                    loading="lazy"
                    src={psychologist.imageUrl}
                    width="480"
                  />
                  <div className="p-6">
                    <h2 className="font-sans text-2xl font-semibold text-secondary">
                      {psychologist.name}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {psychologist.credential} · {psychologist.experienceLabel}
                    </p>
                    <Link
                      className="mt-5 inline-flex font-semibold text-secondary underline underline-offset-4"
                      to={`/psychologists/${psychologist.slug}`}
                    >
                      {t('routes.psychologists.viewProfile', { name: psychologist.nickname })}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export function PsychologistsPage() {
  return <PsychologistDirectory />
}
