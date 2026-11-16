import type { FeaturedProductPublicDto } from '@attentiveid/shared'

/** Shape of a card in the homepage "Featured Campaigns & Portals" strip. */
export interface FeaturedStripCard {
  id: string
  visible: boolean
  theme: FeaturedProductPublicDto['theme']
  icon: FeaturedProductPublicDto['icon']
  badge: string
  title: string
  description: string
  cta: string
  url: string
  /** Listed but not clickable yet (no page address). */
  comingSoon?: boolean
}

export interface FeaturedCardLabels {
  /** Used when a card has no label of its own. */
  badge: string
  /** Used when a live card has no button text of its own. */
  open: string
  /** Used when a card without a page address has no button text of its own. */
  comingSoon: string
}

const pick = (value: { id: string; en: string }, isId: boolean) => (isId ? value.id || value.en : value.en || value.id).trim()

/**
 * Every featured card on the strip comes from the portal (menu: Produk Featured): look, icon, label,
 * title, description and button text. Empty label/button text fall back to sensible defaults.
 */
export function featuredProductsToCards(
  products: readonly FeaturedProductPublicDto[],
  isId: boolean,
  labels: FeaturedCardLabels,
): FeaturedStripCard[] {
  return products.map((product) => {
    const comingSoon = !product.url
    return {
      id: `product-${product.slug}`,
      visible: true,
      theme: product.theme ?? (comingSoon ? 'navy' : 'blue'),
      icon: product.icon ?? 'sparkles',
      badge: pick(product.badge ?? { id: '', en: '' }, isId) || labels.badge,
      title: pick(product.title, isId),
      description: pick(product.description, isId),
      cta: pick(product.cta ?? { id: '', en: '' }, isId) || (comingSoon ? labels.comingSoon : labels.open),
      url: product.url ?? '',
      comingSoon,
    }
  })
}
