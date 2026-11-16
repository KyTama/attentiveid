import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FORM_SELECTOR,
  LIGHTS_CONFIG,
  isAlive,
  lightsEnabledForPath,
  particleAlpha,
  shouldSpawn,
  spawnParticle,
  type Particle,
} from '@/features/ambient-lights/lights'

/**
 * Twinkling lights near the cursor on public pages (not on form pages).
 * Only for mouse/trackpad users who have not asked for reduced motion.
 */
export function AmbientLights() {
  const { pathname } = useLocation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enabled = lightsEnabledForPath(pathname)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!enabled || !canvas) return
    if (typeof window.matchMedia !== 'function') return
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || reduceMotion) return
    const context = canvas.getContext('2d')
    if (!context) return

    let particles: Particle[] = []
    let frame = 0
    let last = { lastSpawnAt: 0, lastX: -1000, lastY: -1000 }
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    const draw = (now: number) => {
      frame = 0
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles = particles.filter((particle) => isAlive(particle, now))
      for (const particle of particles) {
        const alpha = particleAlpha(particle, now)
        if (alpha <= 0) continue
        const y = particle.y + particle.vy * (now - particle.born)
        const radius = particle.size * 3
        const glow = context.createRadialGradient(particle.x, y, 0, particle.x, y, radius)
        glow.addColorStop(0, `rgba(${LIGHTS_CONFIG.color}, ${alpha})`)
        glow.addColorStop(1, `rgba(${LIGHTS_CONFIG.color}, 0)`)
        context.fillStyle = glow
        context.beginPath()
        context.arc(particle.x, y, radius, 0, Math.PI * 2)
        context.fill()
      }
      if (particles.length > 0 && !document.hidden) frame = window.requestAnimationFrame(draw)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const target = event.target as Element | null
      if (target?.closest?.(FORM_SELECTOR)) return
      const now = performance.now()
      if (!shouldSpawn({ ...last, count: particles.length }, event.clientX, event.clientY, now)) return
      last = { lastSpawnAt: now, lastX: event.clientX, lastY: event.clientY }
      particles.push(spawnParticle(event.clientX, event.clientY, now))
      if (!frame) frame = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      if (frame) window.cancelAnimationFrame(frame)
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5]"
      data-testid="ambient-lights"
      ref={canvasRef}
    />
  )
}
