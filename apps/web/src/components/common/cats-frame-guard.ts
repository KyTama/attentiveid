/**
 * The cats live in the page, but a frame (the embedded services site) is a separate window: the mouse never reports to
 * the page while it is over the frame, and a press on a cat there would go to the frame instead (clicking buttons and
 * selecting text under the cat). So while a cat stands over a frame, a see-through catcher follows it. It takes the
 * mouse for the cat (pet, drag, play), keeps taking it while a cat is dragged across the frame, and gives the frame
 * back the moment the cat moves away. Away from frames nothing is added.
 */

interface CatLike {
  alive?: boolean
  state?: string
  s?: number
  P?: { id?: string }
  hp?: Record<string, [number, number]>
}

interface CatsAppLike {
  cats?: CatLike[]
  hoverCat?: unknown
  press?: unknown
  setCursor?: (mode: string | null) => void
}

interface CatsApiLike {
  _app?: () => CatsAppLike | null
}

const BODY_POINTS = ['pelvis', 'spine1', 'spine2', 'neck', 'head', 'headC', 'pawFR', 'pawFL', 'pawHR', 'pawHL', 'tipFR', 'tipFL'] as const

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

const catRect = (cat: CatLike): Rect | null => {
  const hp = cat.hp
  if (!hp) return null
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const key of BODY_POINTS) {
    const point = hp[key]
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) continue
    left = Math.min(left, point[0])
    right = Math.max(right, point[0])
    top = Math.min(top, point[1])
    bottom = Math.max(bottom, point[1])
  }
  if (!Number.isFinite(left)) return null
  const pad = Math.max(14, (cat.s ?? 1) * 7)
  return { left: left - pad, top: top - pad, right: right + pad, bottom: bottom + pad }
}

const overlaps = (a: Rect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

export function guardCatsOverFrames(api: unknown): () => void {
  const zones = new Map<CatLike, HTMLDivElement>()
  let raf = 0
  let stopped = false
  let lastFrameScan = -Infinity
  let frames: DOMRect[] = []
  const watched = new WeakSet<Element>()
  const watchedFrames: Array<{ frame: Element; onEnter: () => void }> = []

  const makeZone = (cat: CatLike, app: CatsAppLike) => {
    const zone = document.createElement('div')
    zone.setAttribute('data-cat-catcher', '')
    zone.setAttribute('aria-hidden', 'true')
    Object.assign(zone.style, {
      position: 'fixed',
      zIndex: '59',
      background: 'transparent',
      pointerEvents: 'auto',
      userSelect: 'none',
      touchAction: 'none',
    })
    // Keep the mouse for a cat that is being dragged, even when it is dragged over the frame.
    zone.addEventListener('pointerdown', (event) => {
      try {
        zone.setPointerCapture(event.pointerId)
      } catch {
        // no capture: the cat still gets the press
      }
    })
    // Left the cat: the cat's own hover cursor must not stay on.
    zone.addEventListener('pointerleave', () => {
      if (!app.press) {
        app.hoverCat = null
        app.setCursor?.(null)
      }
    })
    document.body.appendChild(zone)
    zones.set(cat, zone)
    return zone
  }

  const removeZone = (cat: CatLike) => {
    zones.get(cat)?.remove()
    zones.delete(cat)
  }

  const tick = (now: number) => {
    if (stopped) return
    const app = (api as CatsApiLike | null)?._app?.() ?? null
    if (!app?.cats) {
      for (const cat of [...zones.keys()]) removeZone(cat)
      raf = requestAnimationFrame(tick)
      return
    }
    // Frames are few and move rarely: look again a few times a second.
    if (now - lastFrameScan > 250) {
      lastFrameScan = now
      const frameEls = [...document.querySelectorAll('iframe')]
      // The mouse going into a frame ends any cat's "hovered" look (the page hears nothing more from the mouse there).
      for (const frame of frameEls) {
        if (watched.has(frame)) continue
        watched.add(frame)
        const onEnter = () => {
          const current = (api as CatsApiLike | null)?._app?.()
          if (current && !current.press) {
            current.hoverCat = null
            current.setCursor?.(null)
          }
        }
        frame.addEventListener('pointerenter', onEnter)
        watchedFrames.push({ frame, onEnter })
      }
      frames = frameEls
        .map((frame) => frame.getBoundingClientRect())
        .filter((rect) => rect.width > 40 && rect.height > 40 && rect.bottom > 0 && rect.top < innerHeight)
    }
    const present = new Set<CatLike>()
    if (frames.length > 0) {
      for (const cat of app.cats) {
        if (!cat.alive || cat.state === 'exit' || cat.state === 'gone') continue
        const rect = catRect(cat)
        if (!rect || !frames.some((frame) => overlaps(rect, frame))) continue
        present.add(cat)
        const zone = zones.get(cat) ?? makeZone(cat, app)
        zone.style.left = `${Math.round(rect.left)}px`
        zone.style.top = `${Math.round(rect.top)}px`
        zone.style.width = `${Math.round(rect.right - rect.left)}px`
        zone.style.height = `${Math.round(rect.bottom - rect.top)}px`
      }
    }
    for (const cat of [...zones.keys()]) if (!present.has(cat)) removeZone(cat)
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    for (const cat of [...zones.keys()]) removeZone(cat)
    for (const { frame, onEnter } of watchedFrames) frame.removeEventListener('pointerenter', onEnter)
  }
}
