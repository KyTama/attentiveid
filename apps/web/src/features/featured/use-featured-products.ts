import { useEffect, useState } from 'react'
import type { FeaturedProductPublicDto } from '@attentiveid/shared'
import { listActiveFeaturedProducts } from '@/features/admin-tools/service'

/** Featured products running right now (the period is set in the portal and never shown to visitors). */
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
