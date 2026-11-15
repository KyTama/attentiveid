import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createAttendController } from '@/features/let-there-be-light/engine'
import '@/features/let-there-be-light/let-there-be-light.css'

const FONT_LINK_ID = 'attend-ltbl-fonts'
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Instrument+Sans:wght@400;500;600&display=swap'

export function LetThereBeLightPage() {
  const location = useLocation()
  const { i18n } = useTranslation()

  const rootRef = useRef<HTMLDivElement>(null)
  const skyRef = useRef<HTMLCanvasElement>(null)
  const dustRef = useRef<HTMLCanvasElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousTitle = document.title
    const previousLang = document.documentElement.lang || i18n.language || 'en'
    document.title = 'Attend'

    let fontLink = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.id = FONT_LINK_ID
      fontLink.rel = 'stylesheet'
      fontLink.href = GOOGLE_FONTS_HREF
      document.head.append(fontLink)
    }

    const root = rootRef.current
    const skyCanvas = skyRef.current
    const dustCanvas = dustRef.current
    const main = mainRef.current
    const card = cardRef.current

    if (!root || !skyCanvas || !dustCanvas || !main || !card) {
      return () => {
        document.title = previousTitle
        document.documentElement.lang = previousLang
      }
    }

    const controller = createAttendController({
      root,
      skyCanvas,
      dustCanvas,
      main,
      card,
      initialHash: location.hash,
      onLanguageChange: (lang) => {
        document.documentElement.lang = lang
      },
    })

    return () => {
      controller.destroy()
      document.title = previousTitle
      document.documentElement.lang = previousLang
    }
  }, [location.hash, i18n.language])

  return (
    <div ref={rootRef} className="attend-root">
      <canvas ref={skyRef} className="attend-sky" aria-hidden="true" />
      <canvas ref={dustRef} className="attend-dust" aria-hidden="true" />
      <div className="room">
        <main ref={mainRef} data-route-heading="" tabIndex={-1} aria-label="Attend">
          <div ref={cardRef} className="card" aria-live="polite" />
        </main>
      </div>
    </div>
  )
}
