import type { FeaturedProductPublicDto } from '@attentiveid/shared'

/** Shape of a card in the homepage "Featured Campaigns & Portals" strip. */
export interface FeaturedStripCard {
  id: string
  visible: boolean
  theme: 'gold' | 'navy' | 'blue' | 'emerald'
  icon: 'gift' | 'calendar' | 'clipboard' | 'sparkles' | 'shield' | 'message'
  badge: string
  title: string
  description: string
  cta: string
  url: string
  /** Listed but not clickable yet (no page address). */
  comingSoon?: boolean
}

export interface FeaturedCardLabels {
  badge: string
  open: string
  comingSoon: string
}

/**
 * Featured products (portal: Produk Featured) become cards at the end of the strip. A product whose
 * page is already used by one of the strip's own cards is skipped so nothing shows twice.
 */
export function featuredProductsToCards(
  products: readonly FeaturedProductPublicDto[],
  isId: boolean,
  labels: FeaturedCardLabels,
  existingUrls: readonly string[] = [],
): FeaturedStripCard[] {
  return products
    .filter((product) => !product.url || !existingUrls.includes(product.url))
    .map((product) => ({
      id: `product-${product.slug}`,
      visible: true,
      theme: product.url ? ('blue' as const) : ('navy' as const),
      icon: 'sparkles' as const,
      badge: labels.badge,
      title: isId ? product.title.id : product.title.en,
      description: (isId ? product.description.id : product.description.en) ?? '',
      cta: product.url ? labels.open : labels.comingSoon,
      url: product.url ?? '',
      comingSoon: !product.url,
    }))
}
