import type { GiftFrequency } from '@attentiveid/shared'

/** Width of the gift on screen at each growth step (px). After the last step it covers the whole screen. */
export const GIFT_STEP_SIZES = [88, 132, 190, 280, 420] as const

/** The cats try this many times to get the visitor's attention before the second cat joins and the gift starts to grow. */
export const ATTEMPTS_BEFORE_ESCALATION = 3

/** Time between two growth steps. */
export const GROW_INTERVAL_MS = 3500

/** Without cats: how long the small gift waits before it starts to grow. */
export const NO_CAT_START_DELAY_MS = 5000

/** With cats: how long to wait for a cat to be ready before giving up and growing the gift without them. */
export const CAT_READY_TIMEOUT_MS = 12000

/** Where the gift is in its story. */
export type GiftStage = 'hidden' | 'waiting' | 'cover' | 'open' | 'question' | 'done'

/** The size index to show after `step`; `GIFT_STEP_SIZES.length` means "covers the screen". */
export const nextStep = (step: number) => Math.min(step + 1, GIFT_STEP_SIZES.length)

export const coversScreen = (step: number) => step >= GIFT_STEP_SIZES.length

const SESSION_KEY = 'attentive-gift-shown'
const DAY_KEY = 'attentive-gift-day'

const today = (now: Date) => {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Should the gift show now? `session`: once per browser session; `day`: once a day; `always`: every visit. */
export const giftDue = (frequency: GiftFrequency, now: Date = new Date()): boolean => {
  if (frequency === 'always') return true
  try {
    if (frequency === 'session') return window.sessionStorage.getItem(SESSION_KEY) !== '1'
    return window.localStorage.getItem(DAY_KEY) !== today(now)
  } catch {
    // storage blocked: do not nag on every page
    return !memoryShown
  }
}

let memoryShown = false

export const markGiftShown = (frequency: GiftFrequency, now: Date = new Date()) => {
  memoryShown = true
  try {
    if (frequency === 'session') window.sessionStorage.setItem(SESSION_KEY, '1')
    else if (frequency === 'day') window.localStorage.setItem(DAY_KEY, today(now))
  } catch {
    // ignore
  }
}
