import '@testing-library/jest-dom/vitest'
import '../src/i18n'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import i18n from '../src/i18n'

beforeAll(async () => {
  await i18n.changeLanguage('en')
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
