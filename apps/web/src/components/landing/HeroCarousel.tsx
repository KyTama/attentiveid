import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export interface HeroCarouselSlide {
  id: string
  imageSrc: string
  alt: string
  tag: string
  caption: string
  width?: number
  height?: number
}

interface HeroCarouselProps {
  slides: HeroCarouselSlide[]
  autoPlayIntervalMs?: number
  className?: string
  showBadge?: boolean
  showControls?: boolean
}

export function HeroCarousel({
  slides,
  autoPlayIntervalMs = 5500,
  className = '',
  showBadge = true,
  showControls = true,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const slideCount = slides.length

  const goToSlide = useCallback(
    (index: number, newDirection?: number) => {
      setDirection(newDirection !== undefined ? newDirection : index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    },
    [currentIndex]
  )

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  // Autoplay timer with pause support
  useEffect(() => {
    if (slideCount <= 1 || isPaused || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      nextSlide()
    }, autoPlayIntervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [slideCount, isPaused, prefersReducedMotion, autoPlayIntervalMs, nextSlide])

  if (!slides.length) return null

  const currentSlide = slides[currentIndex] || slides[0]

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.45 },
        scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.35 },
      },
    }),
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Attentive Clinical Highlights Carousel"
      className={`relative w-full h-full overflow-hidden select-none group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Slide Image Transition */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide.id + currentIndex}
          custom={direction}
          variants={slideVariants}
          initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
          animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.imageSrc}
            alt={currentSlide.alt}
            width={currentSlide.width || 1600}
            height={currentSlide.height || 901}
            decoding="async"
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/consultation-hero.webp'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top Overlay Strip: Slide Counter & Autoplay Toggle (only shown when multi-slide) */}
      {showBadge && slideCount > 1 && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white/90 text-xs font-semibold border border-white/15 shadow-xs">
            <Sparkles className="size-3 text-primary shrink-0" />
            <span className="tabular-nums tracking-wide">
              0{currentIndex + 1} / 0{slideCount}
            </span>
          </div>

          <motion.button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Lanjutkan putar otomatis slide' : 'Jeda putar otomatis slide'}
            title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            className="pointer-events-auto size-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
            transition={INTERACTIVE_SPRING}
            whileTap={{ scale: 0.92 }}
          >
            {isPaused ? <Play className="size-3.5 fill-white" /> : <Pause className="size-3.5 fill-white" />}
          </motion.button>
        </div>
      )}

      {/* Bottom Scrim & Slide Information Caption (only shown when multi-slide) */}
      {slideCount > 1 && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-14 pb-5 sm:pb-6 px-5 sm:px-8 z-10 pointer-events-none">
          <motion.div
            key={currentSlide.id + '-caption'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1.5 max-w-xl"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 tracking-wider uppercase">
              {currentSlide.tag}
            </span>
            <p className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed drop-shadow-xs line-clamp-2">
              {currentSlide.caption}
            </p>
          </motion.div>

          {/* Carousel Indicators / Navigation Dots */}
          <div className="mt-3.5 flex items-center gap-2 pointer-events-auto">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Pindah ke slide ${idx + 1}: ${slide.tag}`}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  idx === currentIndex
                    ? 'w-7 bg-primary shadow-xs'
                    : 'w-2 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Side Arrow Navigation Buttons (Desktop & Hover) */}
      {showControls && slideCount > 1 && (
        <>
          <motion.button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            transition={INTERACTIVE_SPRING}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <ChevronLeft className="size-5 stroke-[2.5]" />
          </motion.button>

          <motion.button
            type="button"
            onClick={nextSlide}
            aria-label="Slide selanjutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            transition={INTERACTIVE_SPRING}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <ChevronRight className="size-5 stroke-[2.5]" />
          </motion.button>
        </>
      )}
    </div>
  )
}
