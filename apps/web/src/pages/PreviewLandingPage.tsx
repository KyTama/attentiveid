import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Homepage } from '@/components/landing/Homepage'
import { LandingContentProvider } from '@/features/content/LandingContentProvider'
import {
  loadPreviewLandingContent,
  type LandingContentLoader,
  type LandingContentResult,
} from '@/features/content/service'

export function PreviewLandingPage({ loader = loadPreviewLandingContent }: { loader?: LandingContentLoader }) {
  const { t } = useTranslation()
  const [state, setState] = useState<LandingContentResult | { status: 'loading' }>({ status: 'loading' })

  useEffect(() => {
    let active = true
    loader().then((result) => {
      if (active) setState(result)
    }).catch(() => {
      if (active) setState({ status: 'unavailable' })
    })
    return () => {
      active = false
    }
  }, [loader])

  if (state.status === 'success') {
    return (
      <LandingContentProvider content={state.content}>
        <Homepage />
      </LandingContentProvider>
    )
  }

  return (
    <main aria-busy={state.status === 'loading'} className="grid min-h-screen place-items-center bg-[#fbf8f2] px-5 text-secondary">
      <div className="max-w-xl text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] outline-none sm:text-5xl" data-route-heading tabIndex={-1}>
          {state.status === 'loading' ? t('routes.preview.loadingTitle') : t('routes.preview.unavailableTitle')}
        </h1>
        <p className="mt-5 text-base leading-7 text-secondary/75">
          {state.status === 'loading' ? t('routes.preview.loadingDescription') : t('routes.preview.unavailableDescription')}
        </p>
      </div>
    </main>
  )
}
