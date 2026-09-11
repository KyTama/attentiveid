import { createContext } from 'react'
import type { IntakeConcernId } from '@attentiveid/shared'

export interface IntakeModalOptions {
  concernId?: IntakeConcernId
  psychologistId?: string
}

export interface IntakeModalContextValue {
  isOpen: boolean
  options: IntakeModalOptions
  openIntake: (options?: IntakeModalOptions) => void
  closeIntake: () => void
}

export const IntakeModalContext = createContext<IntakeModalContextValue | undefined>(undefined)
