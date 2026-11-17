import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startGiftCats } from '../src/features/gift/gift-cats'

interface FakeCat {
  alive: boolean
  state: string
  x: number
  plat: { floor: boolean }
  hp: Record<string, [number, number]>
  walkTo: ReturnType<typeof vi.fn>
  startPosture: ReturnType<typeof vi.fn>
}

const makeCat = (x: number): FakeCat => {
  const cat: FakeCat = {
    alive: true,
    state: 'idle',
    x,
    plat: { floor: true },
    hp: { head: [x, 900] },
    walkTo: vi.fn((target: number) => {
      // the cat arrives straight away in the test
      cat.x = target
      cat.hp.head = [target, 900]
    }),
    startPosture: vi.fn(),
  }
  return cat
}

describe('gift cat choreography', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 16) as unknown as number)
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
  })
  afterEach(() => {
    document.querySelectorAll('[data-gift-bubble]').forEach((el) => el.remove())
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const baseOptions = (cats: FakeCat[], extra: Partial<Parameters<typeof startGiftCats>[0]> = {}) => {
    const calls = { call: [] as number[], escalate: 0, clicked: 0, unavailable: 0 }
    const options = {
      api: () => ({ running: () => true, _app: () => ({ cats, catAt: () => null }) }),
      giftX: () => 1000,
      onCall: (attempt: number) => calls.call.push(attempt),
      onEscalate: () => {
        calls.escalate += 1
      },
      onCatClicked: () => {
        calls.clicked += 1
      },
      onUnavailable: () => {
        calls.unavailable += 1
      },
      bubbleText: () => 'Click me!',
      readyTimeoutMs: 12000,
      ...extra,
    }
    return { options, calls }
  }

  it('walks a cat to the gift, calls with a "Click me!" bubble, and brings a second cat after three unanswered tries', async () => {
    const lead = makeCat(100)
    const other = makeCat(50)
    const { options, calls } = baseOptions([lead, other])
    const director = startGiftCats(options)

    await vi.advanceTimersByTimeAsync(600)
    expect(lead.walkTo).toHaveBeenCalledWith(904)
    expect(calls.call).toEqual([1])
    expect(document.querySelector('[data-gift-bubble]')?.textContent).toBe('Click me!')
    expect(calls.escalate).toBe(0)

    // call (bubble), walk away, come back: attempt 2 then 3
    await vi.advanceTimersByTimeAsync(20000)
    expect(calls.call.length).toBeGreaterThanOrEqual(3)
    expect(calls.call.slice(0, 3)).toEqual([1, 2, 3])
    expect(calls.escalate).toBe(1)
    // the second cat goes to the gift too
    await vi.advanceTimersByTimeAsync(1000)
    expect(other.walkTo).toHaveBeenCalledWith(1096)
    expect(document.querySelectorAll('[data-gift-bubble]').length).toBeGreaterThanOrEqual(1)

    director.stop()
    expect(document.querySelectorAll('[data-gift-bubble]')).toHaveLength(0)
  })

  it('reports a click on the bubble, and gives up when no cat shows up', async () => {
    const lead = makeCat(100)
    const { options, calls } = baseOptions([lead])
    const director = startGiftCats(options)
    await vi.advanceTimersByTimeAsync(600)
    ;(document.querySelector('[data-gift-bubble]') as HTMLButtonElement).click()
    expect(calls.clicked).toBe(1)
    director.stop()

    // the script is running but builds no cat: it is given three times the wait, then the gift grows without cats
    const none = baseOptions([], { readyTimeoutMs: 1000 })
    startGiftCats(none.options)
    await vi.advanceTimersByTimeAsync(2500)
    expect(none.calls.unavailable).toBe(0)
    await vi.advanceTimersByTimeAsync(1500)
    expect(none.calls.unavailable).toBe(1)
  })

  it('reports a click on a cat that stands at the clicked spot', async () => {
    const lead = makeCat(100)
    const { options, calls } = baseOptions([lead])
    options.api = () => ({ running: () => true, _app: () => ({ cats: [lead], catAt: () => lead }) })
    const director = startGiftCats(options)
    await vi.advanceTimersByTimeAsync(600)
    window.dispatchEvent(new Event('pointerdown'))
    window.dispatchEvent(Object.assign(new Event('pointerdown'), { clientX: 10, clientY: 10 }))
    expect(calls.clicked).toBeGreaterThanOrEqual(1)
    director.stop()
  })

  it('stops quietly when the cats are switched off while it runs', async () => {
    const lead = makeCat(100)
    let running = true
    const { options, calls } = baseOptions([lead], { api: () => ({ running: () => running, _app: () => ({ cats: [lead], catAt: () => null }) }) })
    startGiftCats(options)
    await vi.advanceTimersByTimeAsync(600)
    running = false
    await vi.advanceTimersByTimeAsync(600)
    expect(calls.unavailable).toBe(1)
    expect(document.querySelectorAll('[data-gift-bubble]')).toHaveLength(0)
  })
})
