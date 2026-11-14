import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PdfPreviewProps {
  url: string
}

type PreviewState = 'loading' | 'ready' | 'error'

/**
 * Draws every page of the (already truncated) preview PDF onto canvases.
 * pdf.js is loaded on demand so it never weighs on the rest of the site.
 */
export function PdfPreview({ url }: PdfPreviewProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PreviewState>('loading')

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    async function render() {
      try {
        const [pdfjs, worker] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ])
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default
        const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise
        const width = Math.max(320, container!.clientWidth)
        const ratio = Math.min(window.devicePixelRatio || 1, 2)

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber)
          if (cancelled) return
          const base = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: (width / base.width) * ratio })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.className = 'block h-auto w-full rounded-xl border border-secondary/10 bg-white shadow-xs'
          canvas.setAttribute('role', 'img')
          canvas.setAttribute('aria-label', `${pageNumber} / ${pdf.numPages}`)
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas is not available')
          await page.render({ canvasContext: context, viewport }).promise
          if (cancelled) return
          container!.appendChild(canvas)
          if (pageNumber === 1) setState('ready')
        }
      } catch {
        if (!cancelled) setState('error')
      }
    }

    void render()
    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [url])

  return (
    <div>
      {state === 'loading' && (
        <div className="space-y-4" aria-live="polite">
          <p className="text-center text-sm text-secondary/60">{t('sciBrief.previewLoading')}</p>
          <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-[#eee8df]" />
        </div>
      )}
      {state === 'error' && (
        <p className="rounded-xl border border-secondary/15 bg-white p-6 text-center text-sm text-secondary/75" role="alert">
          {t('sciBrief.previewError')}{' '}
          <a className="font-semibold text-primary underline" href={url} rel="noopener noreferrer" target="_blank">
            {t('sciBrief.openPdf')}
          </a>
        </p>
      )}
      <div className="space-y-5" ref={containerRef} />
    </div>
  )
}
