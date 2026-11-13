import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import {
  getLandingContentMutationErrors,
  type LandingContentMutation,
  validateLandingContentMutation,
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import { createAdminCapability } from '../services/authorization-capability'
import type { AuthTokenService, AuthUserRepository } from './auth'
import * as schema from '../db/schema'
import { extractImageDimensions } from '../services/image-metadata'
import { saveMediaFile } from '../services/media-storage'

const getDefaultDb = () => {
  const { db } = require('../db')
  return db
}

export interface LandingCmsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  landingContentRepository?: {
    getDraftOrPublished?: () => Promise<LandingContentMutation | null>
  }
  previewCapabilities?: {
    issue?: (capability: any, landingRevisionId: string, ttlSeconds?: number) => Promise<{ token: string; expiresAt: string }>
  }
  contentTransitions?: any
  db?: any
}

const hasNonEmptyPayload = (body: unknown): boolean => (
  body !== undefined
  && body !== null
  && !(typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0)
)

const collectLandingValidationErrors = (body: unknown): string[] => {
  const errors = getLandingContentMutationErrors(body)
  if (errors.length === 0 && !validateLandingContentMutation(body)) {
    return ['Payload konten landing page tidak valid atau urutan item tidak konsisten.']
  }
  return errors
}

const publishRevisionTransition = async (contentTransitions: any, adminCap: any, revisionId?: string) => {
  if (typeof contentTransitions.publishLandingDraft === 'function') {
    await contentTransitions.publishLandingDraft(adminCap, revisionId)
  } else if (typeof contentTransitions.publishLandingRevision === 'function') {
    await contentTransitions.publishLandingRevision(adminCap, revisionId)
  }
}

export const createLandingCmsRoutes = (dependencies: LandingCmsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })
  const db = dependencies.db || getDefaultDb()

  return new Elysia({ name: 'landing-cms-routes' })
    .use(roleGuard)
    .get(
      '/api/admin/landing',
      async () => {
        if (dependencies.landingContentRepository?.getDraftOrPublished) {
          const content = await dependencies.landingContentRepository.getDraftOrPublished()
          if (content) {
            return { status: 'success', content }
          }
        }
        return { status: 'success', content: null }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Landing CMS'],
          summary: 'Get active landing content draft or published revision',
          description: 'Returns the full 9-section landing content mutation object for admin editor.',
        },
      }
    )
    .put(
      '/api/admin/landing/draft',
      async ({ body, currentUser, set }: any) => {
        const validationErrors = collectLandingValidationErrors(body)
        if (validationErrors.length > 0) {
          set.status = 400
          return {
            status: 'badRequest',
            message: `Validasi gagal: ${validationErrors[0]}`,
            errors: validationErrors,
          }
        }

        const input: LandingContentMutation = body
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)
          const revision = await dependencies.contentTransitions.createLandingDraft(adminCap, input)
          return { status: 'success', revision }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to save landing draft.' }
        }
      },
      {
        requireRole: ['admin'],
        body: t.Optional(t.Any()),
        detail: {
          tags: ['Landing CMS'],
          summary: 'Save active landing draft revision',
          description: 'Saves updated bilingual copy and repeaters as active draft revision.',
        },
      }
    )
    .post(
      '/api/admin/landing/publish',
      async ({ body, currentUser, set }: any) => {
        const payloadProvided = hasNonEmptyPayload(body)
        if (payloadProvided) {
          const validationErrors = collectLandingValidationErrors(body)
          if (validationErrors.length > 0) {
            set.status = 400
            return {
              status: 'badRequest',
              message: `Validasi gagal: ${validationErrors[0]}`,
              errors: validationErrors,
            }
          }
        }

        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)

          if (payloadProvided) {
            const draft = await dependencies.contentTransitions.createLandingDraft(adminCap, body)
            const draftId = draft?.id
            await publishRevisionTransition(dependencies.contentTransitions, adminCap, draftId)
            return { status: 'success', revisionId: draftId, content: draft?.content }
          }

          await publishRevisionTransition(dependencies.contentTransitions, adminCap)
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to publish landing content.' }
        }
      },
      {
        requireRole: ['admin'],
        body: t.Optional(t.Any()),
        detail: {
          tags: ['Landing CMS'],
          summary: 'Publish active landing draft revision live',
          description: 'Atomically updates published pointer to active draft revision.',
        },
      }
    )
    .post(
      '/api/admin/landing/preview',
      async ({ body, currentUser, set }: any) => {
        if (!dependencies.previewCapabilities?.issue) {
          set.status = 500
          return { status: 'error', message: 'Preview capability service tidak tersedia.' }
        }

        const payloadProvided = hasNonEmptyPayload(body)
        if (payloadProvided) {
          const validationErrors = collectLandingValidationErrors(body)
          if (validationErrors.length > 0) {
            set.status = 400
            return {
              status: 'badRequest',
              message: `Validasi gagal sebelum pratinjau: ${validationErrors[0]}`,
              errors: validationErrors,
            }
          }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)
          let targetRevisionId: string | undefined

          if (payloadProvided && dependencies.contentTransitions?.createLandingDraft) {
            const draft = await dependencies.contentTransitions.createLandingDraft(adminCap, body)
            targetRevisionId = draft?.id
          } else {
            const [aggregate] = await db
              .select({ activeDraftRevisionId: schema.landingAggregates.activeDraftRevisionId })
              .from(schema.landingAggregates)
              .where(eq(schema.landingAggregates.singletonKey, true))
              .limit(1)
            targetRevisionId = aggregate?.activeDraftRevisionId ?? undefined
          }

          if (!targetRevisionId) {
            set.status = 400
            return {
              status: 'badRequest',
              message: 'Belum ada revisi draft aktif untuk dipratinjau. Simpan draft terlebih dahulu.',
            }
          }

          const issued = await dependencies.previewCapabilities.issue(adminCap, targetRevisionId, 300)
          return {
            status: 'success',
            capability: issued.token,
            expiresAt: issued.expiresAt,
            revisionId: targetRevisionId,
          }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err?.message || 'Gagal membuat tautan pratinjau draft.' }
        }
      },
      {
        requireRole: ['admin'],
        body: t.Optional(t.Any()),
        detail: {
          tags: ['Landing CMS'],
          summary: 'Issue one-time landing draft preview capability',
          description: 'Optionally saves the current draft payload and issues a short-lived preview capability token.',
        },
      }
    )
    .post(
      '/api/admin/landing/upload-image',
      async ({ body, set }: any) => {
        try {
          const file = body.file
          if (!file) {
            set.status = 400
            return { status: 'badRequest', message: 'File gambar wajib diunggah.' }
          }

          const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            set.status = 413
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            return {
              status: 'payloadTooLarge',
              message: `Ukuran file gambar (${sizeMB} MB) melebihi batas maksimal 5 MB.`
            }
          }

          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
            set.status = 413
            return {
              status: 'payloadTooLarge',
              message: 'Ukuran file gambar melebihi batas maksimal 5 MB.'
            }
          }

          const detected = extractImageDimensions(buffer)

          const width = detected?.width || (body.width ? Number(body.width) : 1200)
          const height = detected?.height || (body.height ? Number(body.height) : 800)
          const mimeType = detected?.mimeType || file.type || 'image/webp'

          // Determine file extension
          let ext = 'webp'
          if (mimeType === 'image/png') ext = 'png'
          else if (mimeType === 'image/jpeg') ext = 'jpg'

          const rawSectionKey = (body.sectionKey || 'landing').trim().toLowerCase()
          const safeSectionKey = rawSectionKey.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'landing'
          const itemSuffix = body.itemPosition !== undefined && body.itemPosition !== null && String(body.itemPosition).trim() !== ''
            ? `-item-${body.itemPosition}`
            : ''
          const rawSlug = (body.slug || body.name || `${safeSectionKey}${itemSuffix}`).trim().toLowerCase()
          const safeSlug = rawSlug.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || safeSectionKey
          const filename = `${safeSlug}.${ext}`
          const objectKey = `media/landing/${filename}`

          // Save media safely via centralized storage helper
          await saveMediaFile({
            subDir: 'landing',
            filename,
            buffer
          })

          const altId = body.altId || `Gambar ${body.sectionKey || 'landing'} Attentive.id`
          const altEn = body.altEn || `Attentive.id ${body.sectionKey || 'landing'} illustration`

          // Upsert in media_objects
          const existing = await db
            .select({ id: schema.mediaObjects.id })
            .from(schema.mediaObjects)
            .where(eq(schema.mediaObjects.objectKey, objectKey))
            .limit(1)

          let mediaId: string
          if (existing.length > 0) {
            await db
              .update(schema.mediaObjects)
              .set({
                width,
                height,
                mimeType,
                byteSize: buffer.length,
                altId,
                altEn,
                lifecycle: 'active',
                updatedAt: new Date().toISOString()
              })
              .where(eq(schema.mediaObjects.id, existing[0].id))
            mediaId = existing[0].id
          } else {
            const [inserted] = await db
              .insert(schema.mediaObjects)
              .values({
                objectKey,
                width,
                height,
                mimeType,
                byteSize: buffer.length,
                altId,
                altEn,
                lifecycle: 'active'
              })
              .returning({ id: schema.mediaObjects.id })
            mediaId = inserted.id
          }

          return {
            status: 'success',
            message: 'Gambar konten landing page berhasil diunggah!',
            media: {
              id: mediaId,
              reference: objectKey,
              width,
              height,
              alt: {
                id: altId,
                en: altEn
              }
            }
          }
        } catch (err: any) {
          set.status = 500
          return {
            status: 'error',
            message: err?.message || 'Gagal mengunggah gambar konten landing page.'
          }
        }
      },
      {
        requireRole: ['admin'],
        body: t.Object({
          file: t.File(),
          sectionKey: t.Optional(t.String()),
          itemPosition: t.Optional(t.Numeric()),
          slug: t.Optional(t.String()),
          name: t.Optional(t.String()),
          altId: t.Optional(t.String()),
          altEn: t.Optional(t.String()),
          width: t.Optional(t.Numeric()),
          height: t.Optional(t.Numeric())
        }),
        detail: {
          tags: ['Landing CMS'],
          summary: 'Upload landing section or item image',
          description: 'Uploads, analyzes dimensions, and registers media object for landing content.'
        }
      }
    )
}
