import { useLayoutEffect, useRef, useState } from 'react'
import { HeroSlideBody } from '@/components/landing/HomepageHero'
import type { ResolvedHeroSlide } from '@/features/content/hero-slides'

/** The homepage's desktop width for the hero; the preview draws at this size and is scaled down to fit the editor. */
const WIDTH = 1280
const HEIGHT = 640

/** The slide exactly as the homepage draws it, made smaller. Not clickable. */
export function HeroSlidePreview({ slide, isId }: { slide: ResolvedHeroSlide; isId: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const fit = () => element.clientWidth && setScale(element.clientWidth / WIDTH)
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative w-full overflow-hidden" data-testid="hero-slide-preview" ref={box} style={{ height: HEIGHT * scale }}>
      <div
        className="pointer-events-none absolute top-0 left-0 grid origin-top-left grid-cols-[45%_55%] bg-[#F5EFE5]"
        inert
        style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}
      >
        <HeroSlideBody isId={isId} key={slide.id} preview slide={slide} />
      </div>
    </div>
  )
}
