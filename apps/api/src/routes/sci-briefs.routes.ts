import { Elysia, t } from 'elysia'
import { SCI_BRIEF_MAX_PDF_BYTES, validateSciBriefInput } from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import type { AuthTokenService, AuthUserRepository } from './auth'
import type { SciBriefsRepository } from '../repositories/sci-briefs.repository'
import { SciBriefPdfError, splitSciBriefPdf } from '../services/sci-brief-pdf'

export interface SciBriefsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  sciBriefsRepository: SciBriefsRepository
  now?: () => Date
}

const isUniqueViolation = (error: unknown) => {
  const candidate = error as { code?: string; cause?: { code?: string }; message?: string }
  return candidate?.code === '23505' || candidate?.cause?.code === '23505' || /sci_briefs_slug_unique/.test(candidate?.message ?? '')
}

const safeFileName = (name: string) => name.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 120) || 'sci-brief.pdf'

export const createSciBriefsRoutes = (dependencies: SciBriefsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })
  const repository = dependencies.sciBriefsRepository
  const now = dependencies.now ?? (() => new Date())

  return new Elysia({ name: 'sci-briefs-routes' })
    .use(roleGuard)
    // ---- Public -----------------------------------------------------------
    .get(
      '/api/content/sci-briefs',
      async () => ({ status: 'success', briefs: await repository.listPublic(now()) }),
      { detail: { tags: ['Sci-Brief'], summary: 'List released Sci-Briefs' } },
    )
    .get(
      '/api/content/sci-briefs/:slug',
      async ({ params: { slug }, set }: any) => {
        const brief = await repository.getPublicBySlug(slug, now())
        if (!brief) {
          set.status = 404
          return { status: 'notFound', message: 'Sci-Brief not found.' }
        }
        return { status: 'success', brief }
      },
      { detail: { tags: ['Sci-Brief'], summary: 'Get a released Sci-Brief' } },
    )
    .get(
      '/api/content/sci-briefs/:slug/preview.pdf',
      async ({ params: { slug }, set }: any) => {
        const bytes = await repository.getPreviewBySlug(slug, now())
        if (!bytes) {
          set.status = 404
          return { status: 'notFound', message: 'Preview not found.' }
        }
        set.headers['content-type'] = 'application/pdf'
        set.headers['content-disposition'] = 'inline; filename="sci-brief-preview.pdf"'
        set.headers['cache-control'] = 'public, max-age=300'
        return new Response(new Uint8Array(bytes), { headers: set.headers })
      },
      { detail: { tags: ['Sci-Brief'], summary: 'Public preview (first pages only)' } },
    )
    // ---- Admin ------------------------------------------------------------
    .get(
      '/api/admin/sci-briefs',
      async () => ({ status: 'success', briefs: await repository.listAdmin() }),
      { requireRole: ['admin'], detail: { tags: ['Sci-Brief CMS'], summary: 'List all Sci-Briefs' } },
    )
    .post(
      '/api/admin/sci-briefs',
      async ({ body, set }: any) => {
        const parsed = validateSciBriefInput(body)
        if (!parsed.ok) {
          set.status = 400
          return { status: 'badRequest', message: 'Data Sci-Brief belum valid.', errors: parsed.errors }
        }
        try {
          const brief = await repository.create(parsed.value)
          set.status = 201
          return { status: 'success', brief }
        } catch (error) {
          if (isUniqueViolation(error)) {
            set.status = 409
            return { status: 'conflict', message: 'Slug sudah dipakai Sci-Brief lain.', errors: { slug: 'Slug sudah dipakai.' } }
          }
          throw error
        }
      },
      { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Sci-Brief CMS'], summary: 'Create a Sci-Brief' } },
    )
    .put(
      '/api/admin/sci-briefs/:id',
      async ({ params: { id }, body, set }: any) => {
        const parsed = validateSciBriefInput(body)
        if (!parsed.ok) {
          set.status = 400
          return { status: 'badRequest', message: 'Data Sci-Brief belum valid.', errors: parsed.errors }
        }
        const existing = await repository.getAdminById(id)
        if (!existing) {
          set.status = 404
          return { status: 'notFound', message: 'Sci-Brief tidak ditemukan.' }
        }
        try {
          let brief = await repository.update(id, parsed.value)
          // A different preview length means the public preview must be rebuilt from the full file.
          if (brief && existing.hasDocument && existing.previewPages !== parsed.value.previewPages) {
            const full = await repository.getFile(id, 'full')
            if (full) {
              const split = await splitSciBriefPdf(full.data, parsed.value.previewPages)
              await repository.savePreview(id, split.previewPages, split.previewBytes)
              brief = await repository.getAdminById(id)
            }
          }
          return { status: 'success', brief }
        } catch (error) {
          if (isUniqueViolation(error)) {
            set.status = 409
            return { status: 'conflict', message: 'Slug sudah dipakai Sci-Brief lain.', errors: { slug: 'Slug sudah dipakai.' } }
          }
          throw error
        }
      },
      { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Sci-Brief CMS'], summary: 'Update a Sci-Brief' } },
    )
    .delete(
      '/api/admin/sci-briefs/:id',
      async ({ params: { id }, set }: any) => {
        const removed = await repository.remove(id)
        if (!removed) {
          set.status = 404
          return { status: 'notFound', message: 'Sci-Brief tidak ditemukan.' }
        }
        return { status: 'success' }
      },
      { requireRole: ['admin'], detail: { tags: ['Sci-Brief CMS'], summary: 'Delete a Sci-Brief' } },
    )
    .post(
      '/api/admin/sci-briefs/:id/document',
      async ({ params: { id }, body, set }: any) => {
        const existing = await repository.getAdminById(id)
        if (!existing) {
          set.status = 404
          return { status: 'notFound', message: 'Sci-Brief tidak ditemukan.' }
        }
        const file = body.file
        if (file.size > SCI_BRIEF_MAX_PDF_BYTES) {
          set.status = 413
          return { status: 'payloadTooLarge', message: 'Ukuran PDF melebihi batas 15 MB.' }
        }
        const fullBytes = Buffer.from(await file.arrayBuffer())
        try {
          const split = await splitSciBriefPdf(fullBytes, existing.previewPages)
          const brief = await repository.saveDocument(id, {
            documentName: safeFileName(file.name || 'sci-brief.pdf'),
            totalPages: split.totalPages,
            previewPages: split.previewPages,
            previewBytes: split.previewBytes,
            fullBytes,
          })
          return { status: 'success', brief }
        } catch (error) {
          if (error instanceof SciBriefPdfError) {
            set.status = 400
            return { status: 'badRequest', message: error.message }
          }
          throw error
        }
      },
      {
        requireRole: ['admin'],
        body: t.Object({ file: t.File() }),
        detail: { tags: ['Sci-Brief CMS'], summary: 'Upload the full PDF (preview is generated)' },
      },
    )
    .get(
      '/api/admin/sci-briefs/:id/document',
      async ({ params: { id }, set }: any) => {
        const file = await repository.getFile(id, 'full')
        if (!file) {
          set.status = 404
          return { status: 'notFound', message: 'Dokumen belum diunggah.' }
        }
        set.headers['content-type'] = 'application/pdf'
        set.headers['content-disposition'] = `attachment; filename="${safeFileName(file.documentName ?? 'sci-brief.pdf')}"`
        set.headers['cache-control'] = 'private, no-store'
        return new Response(new Uint8Array(file.data), { headers: set.headers })
      },
      { requireRole: ['admin'], detail: { tags: ['Sci-Brief CMS'], summary: 'Download the full PDF' } },
    )
}
