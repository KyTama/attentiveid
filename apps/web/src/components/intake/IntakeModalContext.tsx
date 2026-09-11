import React, { useState, useCallback } from 'react'
import {
  IntakeModalContext,
  type IntakeModalOptions,
} from './intake-modal-context-def'

export function IntakeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<IntakeModalOptions>({})

  const openIntake = useCallback((opts?: IntakeModalOptions) => {
    setOptions(opts || {})
    setIsOpen(true)
  }, [])

  const closeIntake = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <IntakeModalContext.Provider value={{ isOpen, options, openIntake, closeIntake }}>
      {children}
    </IntakeModalContext.Provider>
  )
}
