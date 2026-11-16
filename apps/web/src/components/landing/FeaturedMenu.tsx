import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { FeaturedProductPublicDto } from '@attentiveid/shared'
import { listActiveFeaturedProducts } from '@/features/admin-tools/service'
import { INTERACTIVE_SPRING } from '@/lib/motion'

/** Featured products running right now (the period is set in the portal and never shown here). */
export function useFeaturedProducts(): FeaturedProductPublicDto[] {
  const [products, setProducts] = useState<FeaturedProductPublicDto[]>([])
  useEffect(() => {
    let cancelled = false
    void listActiveFeaturedProducts().then((result) => {
      if (!cancelled && result) setProducts(result)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return products
}

const isExternal = (url: string) => /^https?:\/\//.test(url)

function ProductLink({
  product,
  className,
  comingSoonClassName,
  onNavigate,
}: {
  product: FeaturedProductPublicDto
  className: string
  comingSoonClassName: string
  onNavigate?: () => void
}) {
  const { t, i18n } = useTranslation()
  const isId = !i18n.language?.startsWith('en')
  const title = isId ? product.title.id : product.title.en
  const description = isId ? product.description.id : product.description.en

  if (!product.url) {
    return (
      <div aria-disabled="true" className={comingSoonClassName}>
        <span>{title}</span>
        <span className="shrink-0 rounded-full bg-secondary/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary/60">
          {t('homepage.nav.comingSoon')}
        </span>
      </div>
    )
  }
  const content = (
    <>
      <span className="block">{title}</span>
      {description && <span className="mt-0.5 block text-xs font-normal text-secondary/60">{description}</span>}
    </>
  )
  return isExternal(product.url) ? (
    <a className={className} href={product.url} onClick={onNavigate} rel="noopener noreferrer" target="_blank">
      {content}
    </a>
  ) : (
    <Link className={className} onClick={onNavigate} to={product.url}>
      {content}
    </Link>
  )
}

export function FeaturedMenu({ products }: { products: FeaturedProductPublicDto[] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        rootRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (products.length === 0) return null

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 rounded-md py-1 text-sm font-medium text-secondary/75 outline-none transition-colors duration-150 hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {t('homepage.nav.featured')}
        <ChevronDown aria-hidden="true" className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} size={15} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -4 }}
            id={menuId}
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -4 }}
            transition={INTERACTIVE_SPRING}
          >
            <ul className="min-w-60 max-w-xs rounded-xl border border-secondary/10 bg-white p-1.5 shadow-lg">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductLink
                    className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-secondary/80 outline-none transition-colors hover:bg-black/[0.04] hover:text-secondary focus-visible:bg-black/[0.05]"
                    comingSoonClassName="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium text-secondary/45 cursor-not-allowed select-none"
                    onNavigate={() => setOpen(false)}
                    product={product}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MobileFeatured({ products, onNavigate }: { products: FeaturedProductPublicDto[]; onNavigate: () => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (products.length === 0) return null
  const rowClass =
    'flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-black/[0.03] outline-none focus-visible:ring-2 focus-visible:ring-primary'

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={`${rowClass} cursor-pointer`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{t('homepage.nav.featured')}</span>
        <ChevronDown aria-hidden="true" className={`text-secondary/40 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>
      {open && (
        <ul className="mb-1 ml-3 border-l border-secondary/10 pl-2" id={panelId}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductLink
                className={rowClass}
                comingSoonClassName="flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-base font-semibold text-secondary/45 cursor-not-allowed select-none"
                onNavigate={onNavigate}
                product={product}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
