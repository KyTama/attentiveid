import { useContext } from 'react'
import { IntakeModalContext, type IntakeModalContextValue } from './intake-modal-context-def'

const defaultContext: IntakeModalContextValue = {
  isOpen: false,
  options: {},
  openIntake: () => {},
  closeIntake: () => {},
}

export function useIntakeModal(): IntakeModalContextValue {
  const context = useContext(IntakeModalContext)
  return context ?? defaultContext
}
