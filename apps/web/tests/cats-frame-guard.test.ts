import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { guardCatsOverFrames } from '../src/components/common/cats-frame-guard'

const point = (x: number, y: number): [number, number] => [x, y]
const makeCat = (x: number, y: number) => ({
  alive: true,
  state: 'sit',
  s: 2,
  P: { id: 'induk' },
  hp: Object.fromEntries(['pelvis', 'spine1', 'spine2', 'neck', 'head', 'headC', 'pawFR', 'pawFL', 'pawHR', 'pawHL', 'tipFR', 'tipFL'].map((key, i) => [key, point(x + i * 4, y)])),
})

describe('cats frame guard', () => {
  let frame: HTMLIFrameElement
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 16) as unknown as number)
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
    frame = document.createElement('iframe')
    frame.getBoundingClientRect = () => ({ left: 0, top: 70, right: 1000, bottom: 800, width: 1000, height: 730, x: 0, y: 70, toJSON() {} }) as DOMRect
    document.body.appendChild(frame)
  })
  afterEach(() => {
    frame.remove()
    document.querySelectorAll('[data-cat-catcher]').forEach((el) => el.remove())
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('puts a see-through catcher on a cat over a frame, follows it, and removes it when the cat leaves or the guard stops', () => {
    const cat = makeCat(200, 500)
    const app = { cats: [cat], hoverCat: null as unknown, press: null as unknown, setCursor: vi.fn() }
    const stop = guardCatsOverFrames({ _app: () => app })

    vi.advanceTimersByTime(40)
    const zones = document.querySelectorAll<HTMLElement>('[data-cat-catcher]')
    expect(zones).toHaveLength(1)
    expect(zones[0].style.pointerEvents).toBe('auto')
    expect(parseInt(zones[0].style.left)).toBeLessThanOrEqual(200)
    expect(parseInt(zones[0].style.top)).toBeLessThanOrEqual(500)

    // the cat walks along: the catcher goes with it
    Object.assign(cat, makeCat(400, 500))
    vi.advanceTimersByTime(40)
    expect(parseInt(document.querySelector<HTMLElement>('[data-cat-catcher]')!.style.left)).toBeGreaterThan(300)

    // the cat leaves the frame (here: far to the right): the frame gets the mouse back
    Object.assign(cat, makeCat(3000, 500))
    vi.advanceTimersByTime(40)
    expect(document.querySelectorAll('[data-cat-catcher]')).toHaveLength(0)

    Object.assign(cat, makeCat(300, 500))
    vi.advanceTimersByTime(40)
    expect(document.querySelectorAll('[data-cat-catcher]')).toHaveLength(1)
    stop()
    expect(document.querySelectorAll('[data-cat-catcher]')).toHaveLength(0)
  })

  it('adds nothing when there is no frame on the page, or the cat is leaving', () => {
    frame.remove()
    const cat = makeCat(200, 500)
    const stop = guardCatsOverFrames({ _app: () => ({ cats: [cat] }) })
    vi.advanceTimersByTime(300)
    expect(document.querySelectorAll('[data-cat-catcher]')).toHaveLength(0)
    stop()

    document.body.appendChild(frame)
    const leaving = { ...makeCat(200, 500), state: 'exit' }
    const stop2 = guardCatsOverFrames({ _app: () => ({ cats: [leaving] }) })
    vi.advanceTimersByTime(300)
    expect(document.querySelectorAll('[data-cat-catcher]')).toHaveLength(0)
    stop2()
  })

  it('ends a cat hover look when the mouse leaves the cat for the frame', () => {
    const cat = makeCat(200, 500)
    const app = { cats: [cat], hoverCat: {} as unknown, press: null as unknown, setCursor: vi.fn() }
    const stop = guardCatsOverFrames({ _app: () => app })
    vi.advanceTimersByTime(40)
    document.querySelector('[data-cat-catcher]')!.dispatchEvent(new Event('pointerleave'))
    expect(app.hoverCat).toBeNull()
    expect(app.setCursor).toHaveBeenCalledWith(null)
    stop()
  })
})
