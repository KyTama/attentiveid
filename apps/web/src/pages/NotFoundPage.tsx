import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="grid min-h-screen place-items-center bg-dominant px-4 py-20 text-center">
      <div>
        <h1
          className="font-sans text-5xl font-semibold text-secondary outline-none md:text-7xl"
          data-route-heading
          tabIndex={-1}
        >
          {t('routes.notFound.title')}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          {t('routes.notFound.description')}
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-4 font-semibold text-white"
          to="/"
        >
          {t('routes.common.home')}
        </Link>
      </div>
    </main>
  )
}
