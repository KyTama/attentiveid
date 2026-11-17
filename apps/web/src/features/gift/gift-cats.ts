import { ATTEMPTS_BEFORE_ESCALATION } from './gift-timeline'

/**
 * Steers the walking cats for the gift: one cat walks to the gift and calls the visitor ("Click me!"), walks away and comes
 * back. After a few tries with no click, a second cat joins and `onEscalate` fires (the page then grows the gift).
 * It only gives orders (walk here, sit); the cats keep their own behaviour in between. It reads the cats through the
 * script's internal handle, and every call is guarded, so a change in the cat script can only stop the choreography.
 */

interface CatLike {
  alive?: boolean
  state?: string
  x?: number
  plat?: { floor?: boolean } | null
  hp?: Record<string, [number, number]>
  walkTo?: (x: number) => void
  startPosture?: (kind: string, seconds: number) => void
}

interface CatsAppLike {
  cats?: CatLike[]
  catAt?: (x: number, y: number) => CatLike | null
}

interface CatsApiLike {
  running?: () => boolean
  _app?: () => CatsAppLike | null
}

export interface GiftCatsOptions {
  api: () => CatsApiLike | undefined
  /** Where the gift stands, in screen pixels from the left. */
  giftX: () => number
  /** A cat arrived and is calling for the `attempt`th time (1-based). */
  onCall?: (attempt: number) => void
  /** The cats tried `ATTEMPTS_BEFORE_ESCALATION` times and the second cat joined. */
  onEscalate: () => void
  /** The visitor clicked a calling cat or its bubble. */
  onCatClicked: () => void
  /** No cat could be used (none came, or they were switched off). */
  onUnavailable: () => void
  /** Translated bubble text. */
  bubbleText: () => string
  /** Wait this long for a cat before calling `onUnavailable`. */
  readyTimeoutMs: number
  tickMs?: number
  callMs?: number
  awayMs?: number
}

const IDLE = ['idle', 'sit', 'loaf']

export function startGiftCats(options: GiftCatsOptions): { stop: () => void } {
  const tickMs = options.tickMs ?? 250
  const callMs = options.callMs ?? 4500
  const awayMs = options.awayMs ?? 4000
  const startedAt = Date.now()
  let stopped = false
  let lead: CatLike | null = null
  let second: CatLike | null = null
  let phase: 'approach' | 'call' | 'away' = 'approach'
  let phaseSince = Date.now()
  let attempt = 0
  let escalated = false
  let everSawCat = false

  const bubbles = new Map<CatLike, HTMLButtonElement>()
  let raf = 0

  const app = () => options.api()?._app?.() ?? null
  const usable = (cat: CatLike | null | undefined): cat is CatLike =>
    Boolean(cat && cat.alive !== false && cat.state !== 'exit' && cat.state !== 'gone' && cat.state !== 'enter' && cat.plat?.floor)

  const setPhase = (next: typeof phase) => {
    phase = next
    phaseSince = Date.now()
  }

  const bubbleFor = (cat: CatLike) => {
    let bubble = bubbles.get(cat)
    if (!bubble) {
      bubble = document.createElement('button')
      bubble.type = 'button'
      bubble.setAttribute('data-gift-bubble', '')
      bubble.className = 'gift-bubble'
      bubble.addEventListener('click', () => options.onCatClicked())
      document.body.appendChild(bubble)
      bubbles.set(cat, bubble)
    }
    bubble.textContent = options.bubbleText()
    return bubble
  }

  const hideBubbles = () => {
    for (const bubble of bubbles.values()) bubble.remove()
    bubbles.clear()
  }

  // The bubble follows the cat's head every frame.
  const follow = () => {
    if (stopped) return
    for (const [cat, bubble] of bubbles) {
      const head = cat.hp?.head
      if (!head || !Number.isFinite(head[0]) || !Number.isFinite(head[1])) {
        bubble.style.visibility = 'hidden'
        continue
      }
      bubble.style.visibility = 'visible'
      bubble.style.transform = `translate(${Math.round(head[0] - 36)}px, ${Math.round(head[1] - 92)}px)`
    }
    raf = requestAnimationFrame(follow)
  }

  const pickLead = (exclude?: CatLike | null) => app()?.cats?.find((cat) => cat !== exclude && usable(cat)) ?? null

  const goTo = (cat: CatLike, x: number) => {
    if (cat.state === 'walk' || !IDLE.includes(cat.state ?? '')) return false
    cat.walkTo?.(x)
    return true
  }

  const near = (cat: CatLike, x: number) => Math.abs((cat.x ?? Infinity) - x) < 36

  const tick = () => {
    if (stopped) return
    const running = options.api()?.running?.() ?? false
    const cats = app()?.cats ?? []
    if (!running || cats.length === 0) {
      // the script is running but has not built a cat yet (slow device): give it three times as long
      const limit = running ? options.readyTimeoutMs * 3 : options.readyTimeoutMs
      if (everSawCat || Date.now() - startedAt > limit) {
        stop()
        options.onUnavailable()
      }
      return
    }
    if (!usable(lead)) {
      lead = pickLead(second)
      if (!lead) {
        // a cat that is still walking in counts: give it three times as long before giving up
        const entering = cats.some((cat) => cat.alive !== false && cat.state === 'enter')
        const limit = entering ? options.readyTimeoutMs * 3 : options.readyTimeoutMs
        if (!everSawCat && Date.now() - startedAt > limit) {
          stop()
          options.onUnavailable()
        }
        return
      }
      everSawCat = true
      setPhase('approach')
    }
    if (second && !usable(second)) second = null

    const gx = options.giftX()
    const leftSpot = gx - 96
    const rightSpot = gx + 96
    const awaySpot = Math.max(90, gx - 380)

    if (phase === 'approach') {
      if (near(lead, leftSpot)) {
        attempt += 1
        lead.startPosture?.('sit', callMs / 1000 + 1)
        bubbleFor(lead)
        options.onCall?.(attempt)
        setPhase('call')
        if (attempt >= ATTEMPTS_BEFORE_ESCALATION && !escalated) {
          escalated = true
          second = pickLead(lead)
          options.onEscalate()
        }
      } else {
        goTo(lead, leftSpot)
      }
    } else if (phase === 'call') {
      if (second && usable(second)) {
        if (near(second, rightSpot)) bubbleFor(second)
        else goTo(second, rightSpot)
      } else if (escalated) {
        // the second cat arrives when one is free
        second = pickLead(lead)
      }
      if (Date.now() - phaseSince > callMs) {
        hideBubbles()
        setPhase('away')
      }
    } else {
      if (near(lead, awaySpot) || Date.now() - phaseSince > awayMs) setPhase('approach')
      else goTo(lead, awaySpot)
    }
  }

  const timer = window.setInterval(tick, tickMs)
  raf = requestAnimationFrame(follow)

  const onPointerDown = (event: PointerEvent) => {
    const found = app()?.catAt?.(event.clientX, event.clientY)
    if (found && (found === lead || found === second)) options.onCatClicked()
  }
  window.addEventListener('pointerdown', onPointerDown, true)

  function stop() {
    if (stopped) return
    stopped = true
    window.clearInterval(timer)
    cancelAnimationFrame(raf)
    window.removeEventListener('pointerdown', onPointerDown, true)
    hideBubbles()
  }

  return { stop }
}
