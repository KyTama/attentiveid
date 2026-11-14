import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import { IntakeModalProvider, ConsultationIntakeModal, useIntakeModal } from '@/components/intake'
import type { IntakeConcernId } from '@attentiveid/shared'

function PublicIntakeModalWrapper() {
  const { isOpen, options, closeIntake } = useIntakeModal()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/booking') return
    const intakeParam = searchParams.get('intake')
    const concernParam = searchParams.get('concern') as IntakeConcernId | null
    const psychologistParam = searchParams.get('psychologist')

    if (intakeParam === 'true' || concernParam || psychologistParam) {
      const bookingParams = new URLSearchParams()
      if (concernParam) bookingParams.set('concern', concernParam)
      if (psychologistParam) bookingParams.set('psychologist', psychologistParam)
      const search = bookingParams.toString()
      navigate(
        {
          pathname: '/booking',
          search: search ? `?${search}` : '',
        },
        { replace: true },
      )
    }
  }, [searchParams, location.pathname, navigate])

  return (
    <ConsultationIntakeModal
      key={`${isOpen}-${options.concernId}-${options.psychologistId}-${options.initialFormat}`}
      isOpen={isOpen}
      onClose={closeIntake}
      initialConcernId={options.concernId}
      initialPsychologistId={options.psychologistId}
      initialFormat={options.initialFormat}
    />
  )
}

export function PublicLayout() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-route-heading]')?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, navigationType])

  return (
    <IntakeModalProvider>
      <Outlet />
      <PublicIntakeModalWrapper />
    </IntakeModalProvider>
  )
}
