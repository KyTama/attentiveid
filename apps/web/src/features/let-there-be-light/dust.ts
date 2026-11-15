/* =====================================================================
   DUST · motes, embers that fly into the light, fireflies that stay
   ===================================================================== */

export interface DustController {
  draw(time: number, light: number, ox: number, oy: number): void
  burst(x: number, y: number, toX: number, toY: number, count?: number, spawnFly?: boolean): void
  addFly(): void
  clear(): void
  lite(): void
  destroy(): void
}

interface Mote {
  x: number
  y: number
  r: number
  v: number
  ph: number
}

interface Ember {
  x: number
  y: number
  vx: number
  vy: number
  tx: number
  ty: number
  life: number
  max: number
  r: number
}

interface Firefly {
  a: number
  rad: number
  sp: number
  ph: number
  born: number
}

export function createDust(canvas: HTMLCanvasElement, reduceMotion: boolean): DustController {
  let cx: CanvasRenderingContext2D | null = null
  try {
    cx = canvas.getContext('2d')
  } catch {
    cx = null
  }

  if (!cx) {
    return {
      draw() {},
      burst() {},
      addFly() {},
      clear() {},
      lite() {},
      destroy() {},
    }
  }

  let width = 0
  let height = 0
  let dpr = 1
  let flyTimers: number[] = []

  let motes: Mote[] = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() * 1.4,
    v: 0.00004 + Math.random() * 0.00012,
    ph: Math.random() * 6.28,
  }))
  const embers: Ember[] = []
  const flies: Firefly[] = []

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    if (width !== w || height !== h) {
      width = w
      height = h
      canvas.width = w * dpr
      canvas.height = h * dpr
      cx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  function addFly() {
    flies.push({
      a: Math.random() * 6.283,
      rad: 70 + Math.random() * 130,
      sp: (0.0016 + Math.random() * 0.0024) * (Math.random() < 0.5 ? -1 : 1),
      ph: Math.random() * 6.28,
      born: performance.now(),
    })
  }

  function burst(x: number, y: number, toX: number, toY: number, count = 46, spawnFly = true) {
    if (reduceMotion) {
      if (spawnFly) addFly()
      return
    }
    for (let i = 0; i < count; i++) {
      const a = Math.random() * 6.283
      const s = 1 + Math.random() * 3.2
      embers.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1.2,
        tx: toX,
        ty: toY,
        life: 0,
        max: 70 + Math.random() * 60,
        r: 1 + Math.random() * 2.2,
      })
    }
    if (spawnFly) {
      flyTimers.push(window.setTimeout(addFly, 900))
    }
  }

  function glowDot(x: number, y: number, r: number, alpha: number, lit: boolean) {
    if (!cx) return
    const grad = cx.createRadialGradient(x, y, 0, x, y, r * 6)
    if (lit) {
      grad.addColorStop(0, `rgba(255,255,240,${alpha})`)
      grad.addColorStop(0.2, `rgba(242,190,100,${alpha * 0.7})`)
      grad.addColorStop(1, 'rgba(207,156,56,0)')
    } else {
      grad.addColorStop(0, `rgba(255,230,180,${alpha})`)
      grad.addColorStop(0.25, `rgba(242,190,100,${alpha * 0.45})`)
      grad.addColorStop(1, 'rgba(207,156,56,0)')
    }
    cx.fillStyle = grad
    cx.beginPath()
    cx.arc(x, y, r * 6, 0, 6.283)
    cx.fill()
  }

  function draw(time: number, light: number, ox: number, oy: number) {
    if (!cx) return
    size()
    cx.clearRect(0, 0, width, height)
    const lit = light >= 0.55
    cx.globalCompositeOperation = lit ? 'source-over' : 'lighter'

    for (const m of motes) {
      if (!reduceMotion) {
        m.y -= m.v * 16
        m.x += Math.sin(time * 0.3 + m.ph) * 0.00012
        if (m.y < -0.02) {
          m.y = 1.02
          m.x = Math.random()
        }
      }
      const tw = 0.5 + 0.5 * Math.sin(time * 1.3 + m.ph)
      const a = (lit ? 0.1 : 0.05 + light * 0.18) * tw
      cx.fillStyle = lit ? `rgba(120,80,30,${a})` : `rgba(255,220,170,${a})`
      cx.beginPath()
      cx.arc(m.x * width, m.y * height, m.r, 0, 6.283)
      cx.fill()
    }

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i]
      e.life++
      const k = Math.min(1, e.life / e.max)
      e.vx = e.vx * 0.95 + (e.tx - e.x) * 0.0028 * k
      e.vy = e.vy * 0.95 + (e.ty - e.y) * 0.0028 * k - 0.02
      e.x += e.vx
      e.y += e.vy
      glowDot(e.x, e.y, e.r, Math.max(0, 1 - k * k) * 0.9, lit)
      if (e.life > e.max) embers.splice(i, 1)
    }

    for (const f of flies) {
      if (!reduceMotion) f.a += f.sp
      const age = Math.min(1, (performance.now() - f.born) / 1500)
      const wob = reduceMotion ? 0 : Math.sin(time * 1.7 + f.ph) * 10
      const x = ox + Math.cos(f.a) * (f.rad + wob) * 1.25
      const y = oy + Math.sin(f.a) * (f.rad + wob) * 0.5
      const tw = 0.65 + 0.35 * Math.sin(time * 2.4 + f.ph)
      glowDot(x, y, lit ? 1.6 : 2.2, (lit ? 0.9 : 0.95) * tw * age, lit)
    }

    cx.globalCompositeOperation = 'source-over'
  }

  return {
    draw,
    burst,
    addFly,
    clear() {
      flies.length = 0
    },
    lite() {
      motes = motes.slice(0, 25)
    },
    destroy() {
      flyTimers.forEach((timerId) => clearTimeout(timerId))
      flyTimers = []
      embers.length = 0
      flies.length = 0
    },
  }
}
