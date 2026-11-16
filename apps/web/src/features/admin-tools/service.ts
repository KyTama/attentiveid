import type {
  FeaturedProductAdminDto,
  FeaturedProductInput,
  FeaturedProductPublicDto,
  QrCodeDto,
  QrCodeInput,
  SharePreviewDto,
  SharePreviewInput,
  TrafficRow,
} from '@attentiveid/shared'
import { getActiveAuthHeaders } from '../auth/auth-context'

export class AdminToolsApiError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, init: RequestInit = {}, fallback = 'Permintaan gagal'): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      ...getActiveAuthHeaders(),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new AdminToolsApiError(json?.message || `${fallback} (${response.status})`, json?.errors ?? {})
  return json as T
}

// ---- Public ---------------------------------------------------------------

export async function listActiveFeaturedProducts(): Promise<FeaturedProductPublicDto[] | null> {
  try {
    const response = await fetch('/api/content/featured-products')
    if (!response.ok) return null
    const json = await response.json()
    return Array.isArray(json.products) ? json.products : null
  } catch {
    return null
  }
}

/** Fire-and-forget visit count for a main page (no personal data is sent). */
export function trackPageView(path: string, newSession: boolean): void {
  try {
    void fetch('/api/content/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, newSession }),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // never break the page for analytics
  }
}

// ---- Featured products (admin) -------------------------------------------

export const listAdminFeaturedProducts = async () =>
  (await request<{ products: FeaturedProductAdminDto[] }>('/api/admin/featured-products', {}, 'Gagal memuat produk')).products

export const saveAdminFeaturedProduct = async (id: string | undefined, input: Partial<FeaturedProductInput>) =>
  (
    await request<{ product: FeaturedProductAdminDto }>(
      id ? `/api/admin/featured-products/${id}` : '/api/admin/featured-products',
      { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) },
      'Gagal menyimpan produk',
    )
  ).product

export const deleteAdminFeaturedProduct = (id: string) =>
  request<unknown>(`/api/admin/featured-products/${id}`, { method: 'DELETE' }, 'Gagal menghapus produk')

// ---- Share previews (admin) -----------------------------------------------

export const listAdminSharePreviews = async () =>
  (await request<{ previews: SharePreviewDto[] }>('/api/admin/share-previews', {}, 'Gagal memuat thumbnail')).previews

export const saveAdminSharePreview = async (input: SharePreviewInput) =>
  (await request<{ preview: SharePreviewDto }>('/api/admin/share-previews', { method: 'PUT', body: JSON.stringify(input) }, 'Gagal menyimpan thumbnail')).preview

export const deleteAdminSharePreview = (id: string) =>
  request<unknown>(`/api/admin/share-previews/${id}`, { method: 'DELETE' }, 'Gagal menghapus thumbnail')

// ---- Owner only: traffic + QR ---------------------------------------------

export const getTraffic = async () => (await request<{ rows: TrafficRow[] }>('/api/admin/traffic', {}, 'Gagal memuat traffic')).rows

export const listQrCodes = async () => (await request<{ qrCodes: QrCodeDto[] }>('/api/admin/qr-codes', {}, 'Gagal memuat QR')).qrCodes

export const saveQrCode = async (id: string | undefined, input: QrCodeInput) =>
  (
    await request<{ qrCode: QrCodeDto }>(
      id ? `/api/admin/qr-codes/${id}` : '/api/admin/qr-codes',
      { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) },
      'Gagal menyimpan QR',
    )
  ).qrCode

export const deleteQrCode = (id: string) => request<unknown>(`/api/admin/qr-codes/${id}`, { method: 'DELETE' }, 'Gagal menghapus QR')

/** Uploads a link-preview image (JPG/PNG/WebP, max 2 MB) and returns its public URL. */
export async function uploadSharePreviewImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch('/api/admin/share-previews/upload-image', {
    method: 'POST',
    headers: getActiveAuthHeaders(),
    credentials: 'include',
    body: form,
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new AdminToolsApiError(json?.message || `Gagal mengunggah gambar (${response.status})`)
  return json.imageUrl as string
}
