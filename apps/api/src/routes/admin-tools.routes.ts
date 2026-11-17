import { Elysia, t } from 'elysia'
import {
  BOT_USER_AGENT,
  DEFAULT_SHARE_IMAGE,
  normalizeSharePath,
  normalizeTrackedPath,
  summarizeTraffic,
  validateBrowserTab,
  validateCats,
  validateGift,
  validateFeaturedProductInput,
  validateFloatingBar,
  validateQrCodeInput,
  validateSharePreviewInput,
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import { saveMediaFile } from '../services/media-storage'
import type { AuthTokenService, AuthUserRepository } from './auth'
import type { AdminToolsRepository } from '../repositories/admin-tools.repository'

export interface AdminToolsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  repository: AdminToolsRepository
  /** Public site origin, e.g. https://attentiveid.com */
  siteOrigin: string
  now?: () => Date
}

const isUniqueViolation = (error: unknown) => {
  const candidate = error as { code?: string; cause?: { code?: string } }
  return candidate?.code === '23505' || candidate?.cause?.code === '23505'
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const SHARE_IMAGE_MAX_BYTES = 2 * 1024 * 1024

/** Detects jpeg/png/webp from the file's first bytes (the declared type is not trusted). */
export const detectShareImageType = (bytes: Uint8Array): { ext: 'jpg' | 'png' | 'webp' } | null => {
  if (bytes.length > 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: 'jpg' }
  if (bytes.length > 12 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { ext: 'png' }
  if (bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return { ext: 'webp' }
  return null
}

const DEFAULT_TITLE = 'Attentive.id — Biro Psikologi & Konseling Profesional'
const DEFAULT_DESCRIPTION = 'Konsultasi psikologi dan konseling profesional bersama psikolog berlisensi, tatap muka maupun online.'

/** Minimal page for link-preview crawlers (they do not run the site's JavaScript). */
export const buildSharePreviewHtml = (
  origin: string,
  path: string,
  preview: { title: string; description: string; imageUrl: string } | null,
): string => {
  const base = origin.replace(/\/+$/, '')
  const title = preview?.title || DEFAULT_TITLE
  const description = preview?.description || DEFAULT_DESCRIPTION
  const image = preview?.imageUrl || DEFAULT_SHARE_IMAGE
  const imageUrl = /^https?:\/\//.test(image) ? image : `${base}${image}`
  const url = `${base}${path === '/' ? '/' : path}`
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Attentive.id">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
</head><body><p><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></p></body></html>
`
}

/** Any signed-in staff account (admin, psychologist; superadmin always passes) may use the QR generator. */
const QR_ROLES: Array<'admin' | 'psychologist'> = ['admin', 'psychologist']

export const createAdminToolsRoutes = (dependencies: AdminToolsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })
  const repository = dependencies.repository
  const now = dependencies.now ?? (() => new Date())

  return new Elysia({ name: 'admin-tools-routes' })
    .use(roleGuard)
    // ---- Public -----------------------------------------------------------
    .get('/api/content/featured-products', async ({ set }: any) => {
      set.headers['cache-control'] = 'public, max-age=60'
      return { status: 'success', products: await repository.listActiveFeatured(now()) }
    }, { detail: { tags: ['Featured'], summary: 'Featured products running right now' } })
    .get('/api/content/share-html', async ({ query, set }: any) => {
      const path = normalizeSharePath(String(query.path ?? '/')) ?? '/'
      const preview = await repository.getSharePreview(path)
      set.headers['content-type'] = 'text/html; charset=utf-8'
      set.headers['cache-control'] = 'public, max-age=300'
      return buildSharePreviewHtml(dependencies.siteOrigin, path, preview)
    }, { detail: { tags: ['Share previews'], summary: 'Meta-tag page for link-preview crawlers' } })
    .get('/api/content/site-settings', async ({ set }: any) => {
      set.headers['cache-control'] = 'public, max-age=60'
      return { status: 'success', settings: await repository.getSiteSettings() }
    }, { detail: { tags: ['Site settings'], summary: 'Floating bar and browser tab settings' } })
    .post('/api/content/track', async ({ body, headers }: any) => {
      const path = normalizeTrackedPath(body?.path)
      const agent = String(headers['user-agent'] ?? '')
      if (path && agent && !BOT_USER_AGENT.test(agent)) {
        try {
          await repository.recordPageView(path, body?.newSession === true, now())
        } catch {
          // analytics must never break the page
        }
      }
      return { status: 'ok' }
    }, { body: t.Any(), detail: { tags: ['Traffic'], summary: 'Count a main-page visit (no personal data)' } })
    // ---- Admin: featured products ------------------------------------------
    .get('/api/admin/featured-products', async () => ({ status: 'success', products: await repository.listFeaturedAdmin(now()) }),
      { requireRole: ['admin'], detail: { tags: ['Featured'], summary: 'List all featured products' } })
    .post('/api/admin/featured-products', async ({ body, set }: any) => {
      const parsed = validateFeaturedProductInput(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Data produk belum valid.', errors: parsed.errors }
      }
      try {
        const product = await repository.createFeatured(parsed.value)
        set.status = 201
        return { status: 'success', product }
      } catch (error) {
        if (isUniqueViolation(error)) {
          set.status = 409
          return { status: 'conflict', message: 'Slug sudah dipakai.', errors: { slug: 'Slug sudah dipakai.' } }
        }
        throw error
      }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Featured'], summary: 'Create a featured product' } })
    .put('/api/admin/featured-products/order', async ({ body, set }: any) => {
      const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === 'string') : []
      if (!(await repository.reorderFeatured(ids))) {
        set.status = 409
        return { status: 'conflict', message: 'Daftar kartu berubah. Muat ulang halaman lalu coba lagi.' }
      }
      return { status: 'success', products: await repository.listFeaturedAdmin(now()) }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Featured'], summary: 'Set the order of the featured cards' } })
    .put('/api/admin/featured-products/:id', async ({ params: { id }, body, set }: any) => {
      const parsed = validateFeaturedProductInput(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Data produk belum valid.', errors: parsed.errors }
      }
      try {
        const product = await repository.updateFeatured(id, parsed.value)
        if (!product) {
          set.status = 404
          return { status: 'notFound', message: 'Produk tidak ditemukan.' }
        }
        return { status: 'success', product }
      } catch (error) {
        if (isUniqueViolation(error)) {
          set.status = 409
          return { status: 'conflict', message: 'Slug sudah dipakai.', errors: { slug: 'Slug sudah dipakai.' } }
        }
        throw error
      }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Featured'], summary: 'Update a featured product' } })
    .delete('/api/admin/featured-products/:id', async ({ params: { id }, set }: any) => {
      if (!(await repository.removeFeatured(id))) {
        set.status = 404
        return { status: 'notFound', message: 'Produk tidak ditemukan.' }
      }
      return { status: 'success' }
    }, { requireRole: ['admin'], detail: { tags: ['Featured'], summary: 'Delete a featured product' } })
    // ---- Admin: site settings ----------------------------------------------
    .get('/api/admin/site-settings', async () => ({ status: 'success', settings: await repository.getSiteSettings() }),
      { requireRole: ['admin'], detail: { tags: ['Site settings'], summary: 'Read the site settings' } })
    .put('/api/admin/site-settings/floating-bar', async ({ body, set }: any) => {
      const parsed = validateFloatingBar(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Pengaturan bar melayang belum valid.', errors: parsed.errors }
      }
      await repository.saveSiteSetting('floatingBar', parsed.value)
      return { status: 'success', settings: await repository.getSiteSettings() }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Site settings'], summary: 'Save the floating bar' } })
    .put('/api/admin/site-settings/browser-tab', async ({ body, set }: any) => {
      const parsed = validateBrowserTab(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Pengaturan tab browser belum valid.', errors: parsed.errors }
      }
      await repository.saveSiteSetting('browserTab', parsed.value)
      return { status: 'success', settings: await repository.getSiteSettings() }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Site settings'], summary: 'Save the browser tab title and icon' } })
    .put('/api/admin/site-settings/cats', async ({ body }: any) => {
      const parsed = validateCats(body)
      if (!parsed.ok) return { status: 'badRequest' }
      await repository.saveSiteSetting('cats', parsed.value)
      return { status: 'success', settings: await repository.getSiteSettings() }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Site settings'], summary: 'Save the walking cats settings (on/off and pages)' } })
    .put('/api/admin/site-settings/gift', async ({ body, set }: any) => {
      const parsed = validateGift(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Pengaturan hadiah belum valid.', errors: parsed.errors }
      }
      await repository.saveSiteSetting('gift', parsed.value)
      return { status: 'success', settings: await repository.getSiteSettings() }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Site settings'], summary: 'Save the gift settings' } })
    // ---- Admin: share previews ---------------------------------------------
    .get('/api/admin/share-previews', async () => ({ status: 'success', previews: await repository.listSharePreviews() }),
      { requireRole: ['admin'], detail: { tags: ['Share previews'], summary: 'List link previews' } })
    .put('/api/admin/share-previews', async ({ body, set }: any) => {
      const parsed = validateSharePreviewInput(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Data thumbnail belum valid.', errors: parsed.errors }
      }
      return { status: 'success', preview: await repository.saveSharePreview(parsed.value) }
    }, { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Share previews'], summary: 'Create or update the link preview of a page' } })
    .post('/api/admin/share-previews/upload-image', async ({ body, set }: any) => {
      const file = body.file as File
      if (file.size > SHARE_IMAGE_MAX_BYTES) {
        set.status = 413
        return { status: 'payloadTooLarge', message: 'Ukuran gambar maks 2 MB.' }
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const type = detectShareImageType(buffer)
      if (!type) {
        set.status = 400
        return { status: 'badRequest', message: 'Gambar harus JPG, PNG, atau WebP.' }
      }
      const filename = `share-${now().getTime()}-${Math.random().toString(36).slice(2, 8)}.${type.ext}`
      const saved = await saveMediaFile({ subDir: 'share', filename, buffer })
      return { status: 'success', imageUrl: saved.publicUrl }
    }, {
      requireRole: ['admin'],
      body: t.Object({ file: t.File() }),
      detail: { tags: ['Share previews'], summary: 'Upload a link-preview image' },
    })
    .delete('/api/admin/share-previews/:id', async ({ params: { id }, set }: any) => {
      if (!(await repository.removeSharePreview(id))) {
        set.status = 404
        return { status: 'notFound', message: 'Thumbnail tidak ditemukan.' }
      }
      return { status: 'success' }
    }, { requireRole: ['admin'], detail: { tags: ['Share previews'], summary: 'Remove a link preview' } })
    // ---- Traffic: admin accounts. QR codes: any signed-in staff account -------------
    .get('/api/admin/traffic', async () => {
      const dayRows = await repository.listTrafficRows()
      // History is never deleted: `daily` carries every stored day (per page) for the graph.
      return { status: 'success', rows: summarizeTraffic(dayRows, now()), daily: dayRows }
    }, { requireRole: ['admin'], detail: { tags: ['Traffic'], summary: 'Traffic per main page (admins)' } })
    .get('/api/admin/qr-codes', async () => ({ status: 'success', qrCodes: await repository.listQrCodes() }),
      { requireRole: QR_ROLES, detail: { tags: ['QR'], summary: 'List saved QR codes' } })
    .post('/api/admin/qr-codes', async ({ body, set }: any) => {
      const parsed = validateQrCodeInput(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Data QR belum valid.', errors: parsed.errors }
      }
      set.status = 201
      return { status: 'success', qrCode: await repository.createQrCode(parsed.value) }
    }, { requireRole: QR_ROLES, body: t.Any(), detail: { tags: ['QR'], summary: 'Save a QR code' } })
    .put('/api/admin/qr-codes/:id', async ({ params: { id }, body, set }: any) => {
      const parsed = validateQrCodeInput(body)
      if (!parsed.ok) {
        set.status = 400
        return { status: 'badRequest', message: 'Data QR belum valid.', errors: parsed.errors }
      }
      const qrCode = await repository.updateQrCode(id, parsed.value)
      if (!qrCode) {
        set.status = 404
        return { status: 'notFound', message: 'QR tidak ditemukan.' }
      }
      return { status: 'success', qrCode }
    }, { requireRole: QR_ROLES, body: t.Any(), detail: { tags: ['QR'], summary: 'Update a QR code' } })
    .delete('/api/admin/qr-codes/:id', async ({ params: { id }, set }: any) => {
      if (!(await repository.removeQrCode(id))) {
        set.status = 404
        return { status: 'notFound', message: 'QR tidak ditemukan.' }
      }
      return { status: 'success' }
    }, { requireRole: QR_ROLES, detail: { tags: ['QR'], summary: 'Delete a QR code' } })
}
