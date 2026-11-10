import { Elysia, t } from 'elysia'
import fs from 'fs'
import path from 'path'
import { eq } from 'drizzle-orm'
import {
  type LandingContentMutation,
  LandingContentMutationSchema,
  validateLandingContentMutation,
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import { createAdminCapability } from '../services/authorization-capability'
import type { AuthTokenService, AuthUserRepository } from './auth'
import * as schema from '../db/schema'
import { extractImageDimensions } from '../services/image-metadata'

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
  contentTransitions?: any
  db?: any
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
        const input: LandingContentMutation = body
        if (!validateLandingContentMutation(input)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid landing content mutation payload or item bounds.' }
        }

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
        body: LandingContentMutationSchema,
        detail: {
          tags: ['Landing CMS'],
          summary: 'Save active landing draft revision',
          description: 'Saves updated bilingual copy and repeaters as active draft revision.',
        },
      }
    )
    .post(
      '/api/admin/landing/publish',
      async ({ currentUser, set }: any) => {
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)
          await dependencies.contentTransitions.publishLandingRevision(adminCap, new Date().toISOString())
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to publish landing content.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Landing CMS'],
          summary: 'Publish active landing draft revision live',
          description: 'Atomically updates published pointer to active draft revision.',
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

          // Storage destination: apps/web/public/media/landing
          const webRoot = fs.existsSync(path.resolve(process.cwd(), 'apps/web'))
            ? path.resolve(process.cwd(), 'apps/web')
            : path.resolve(process.cwd(), '../web')
          const storageDir = path.resolve(webRoot, 'public/media/landing')
          fs.mkdirSync(storageDir, { recursive: true })
          fs.writeFileSync(path.join(storageDir, filename), buffer)

          // If apps/web/dist exists (production / preview build), sync it too
          const distDir = path.resolve(webRoot, 'dist/media/landing')
          if (fs.existsSync(path.resolve(webRoot, 'dist'))) {
            fs.mkdirSync(distDir, { recursive: true })
            fs.writeFileSync(path.join(distDir, filename), buffer)
          }

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
