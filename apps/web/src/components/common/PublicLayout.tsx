import { useEffect } from 'react'
import { Outlet, useLocation, useNavigationType, useSearchParams } from 'react-router-dom'
import { IntakeModalProvider, ConsultationIntakeModal, useIntakeModal } from '@/components/intake'
import type { IntakeConcernId } from '@attentiveid/shared'

function PublicIntakeModalWrapper() {
  const { isOpen, options, closeIntake, openIntake } = useIntakeModal()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const intakeParam = searchParams.get('intake')
    const concernParam = searchParams.get('concern') as IntakeConcernId | null
    const psychologistParam = searchParams.get('psychologist')

    if (intakeParam === 'true' || concernParam || psychologistParam) {
      openIntake({
        concernId: concernParam || undefined,
        psychologistId: psychologistParam || undefined,
      })
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('intake')
      nextParams.delete('concern')
      nextParams.delete('psychologist')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, openIntake, setSearchParams])

  return (
    <ConsultationIntakeModal
      key={`${isOpen}-${options.concernId}-${options.psychologistId}`}
      isOpen={isOpen}
      onClose={closeIntake}
      initialConcernId={options.concernId}
      initialPsychologistId={options.psychologistId}
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
