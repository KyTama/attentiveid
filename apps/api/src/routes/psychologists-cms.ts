import { Elysia, t } from 'elysia'
import fs from 'fs'
import path from 'path'
import { eq } from 'drizzle-orm'
import {
  getFullPsychologistMutationErrors,
  type FullPsychologistMutation,
  PSYCHOLOGIST_LIFECYCLE_STATES
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import type { AuthTokenService, AuthUserRepository } from './auth'
import { db as defaultDb } from '../db'
import * as schema from '../db/schema'
import { extractImageDimensions } from '../services/image-metadata'

export interface PsychologistsCmsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  db?: typeof defaultDb
  psychologistsRepository: {
    listAdmin?: (query: {
      status?: any
      search?: string
      supportArea?: any
      limit?: number
      offset?: number
    }) => Promise<{ psychologists: any[]; total: number }>
    getAdminById?: (id: string) => Promise<any | null>
    saveAdmin?: (id: string | undefined, input: FullPsychologistMutation) => Promise<any>
    updateStatusAdmin?: (id: string, status: any) => Promise<any | null>
  }
}

const lifecycleStatusSchema = t.Union([
  t.Literal('draft'),
  t.Literal('active'),
  t.Literal('inactive'),
  t.Literal('archived')
])

export const createPsychologistsCmsRoutes = (dependencies: PsychologistsCmsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })
  const db = dependencies.db || defaultDb

  return new Elysia({ name: 'psychologists-cms-routes' })
    .use(roleGuard)
    .get(
      '/api/admin/psychologists',
      async ({ query }: any) => {
        const status = query.status ? query.status : undefined
        const search = query.search ? String(query.search) : undefined
        const supportArea = query.supportArea ? query.supportArea : undefined
        const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 20
        const offset = query.offset ? Math.max(0, Number(query.offset)) : 0

        if (!dependencies.psychologistsRepository.listAdmin) {
          return { status: 'success', psychologists: [], total: 0 }
        }

        const result = await dependencies.psychologistsRepository.listAdmin({
          status,
          search,
          supportArea,
          limit,
          offset
        })

        return { status: 'success', psychologists: result.psychologists, total: result.total }
      },
      {
        requireRole: ['admin'],
        query: t.Object({
          status: t.Optional(t.String()),
          search: t.Optional(t.String()),
          supportArea: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String())
        }),
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'List psychologists for CMS admin',
          description: 'Returns paginated list of psychologists with status & search filters.',
        },
      }
    )
    .get(
      '/api/admin/psychologists/:id',
      async ({ params: { id }, set }: any) => {
        if (!dependencies.psychologistsRepository.getAdminById) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }
        const psychologist = await dependencies.psychologistsRepository.getAdminById(id)
        if (!psychologist) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }
        return { status: 'success', psychologist }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Get psychologist profile by ID',
          description: 'Returns full canonical psychologist profile for admin editing.',
        },
      }
    )
    .post(
      '/api/admin/psychologists',
      async ({ body, set }: any) => {
        const input: FullPsychologistMutation = body
        const validationErrors = getFullPsychologistMutationErrors(input)
        if (validationErrors.length > 0) {
          set.status = 400
          return {
            status: 'badRequest',
            message: `Validasi gagal: ${validationErrors[0]}`,
            errors: validationErrors
          }
        }

        if (!dependencies.psychologistsRepository.saveAdmin) {
          set.status = 500
          return { status: 'error', message: 'Repository saveAdmin not available.' }
        }

        try {
          const psychologist = await dependencies.psychologistsRepository.saveAdmin(undefined, input)
          set.status = 201
          return { status: 'success', psychologist }
        } catch (error: any) {
          const msg = error?.message || ''
          if (error?.code === '23505' || msg.includes('duplicate key') || msg.includes('unique constraint')) {
            set.status = 400
            if (msg.includes('psychologists_featured_order_unique') || msg.includes('featured_order')) {
              return {
                status: 'badRequest',
                message: `Nomor urutan Featured (${input.featuredOrder}) sudah digunakan oleh praktisi lain. Silakan gunakan nomor urut yang berbeda.`,
              }
            }
            if (msg.includes('psychologists_slug_unique') || msg.includes('slug')) {
              return {
                status: 'badRequest',
                message: `Slug URL "${input.slug}" sudah digunakan oleh praktisi lain. Silakan ganti slug URL agar unik.`,
              }
            }
            return { status: 'badRequest', message: 'Terdapat data duplikat yang melanggar aturan keunikan sistem.' }
          }
          set.status = 500
          return { status: 'error', message: error?.message || 'Failed to create psychologist profile.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Create psychologist profile',
          description: 'Creates a new psychologist profile with full relations and translations.',
        },
      }
    )
    .put(
      '/api/admin/psychologists/:id',
      async ({ params: { id }, body, set }: any) => {
        const input: FullPsychologistMutation = body
        const validationErrors = getFullPsychologistMutationErrors(input)
        if (validationErrors.length > 0) {
          set.status = 400
          return {
            status: 'badRequest',
            message: `Validasi gagal: ${validationErrors[0]}`,
            errors: validationErrors
          }
        }

        if (!dependencies.psychologistsRepository.getAdminById || !dependencies.psychologistsRepository.saveAdmin) {
          set.status = 500
          return { status: 'error', message: 'Repository methods not available.' }
        }

        const existing = await dependencies.psychologistsRepository.getAdminById(id)
        if (!existing) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        try {
          const psychologist = await dependencies.psychologistsRepository.saveAdmin(id, input)
          return { status: 'success', psychologist }
        } catch (error: any) {
          const msg = error?.message || ''
          if (error?.code === '23505' || msg.includes('duplicate key') || msg.includes('unique constraint')) {
            set.status = 400
            if (msg.includes('psychologists_featured_order_unique') || msg.includes('featured_order')) {
              return {
                status: 'badRequest',
                message: `Nomor urutan Featured (${input.featuredOrder}) sudah digunakan oleh praktisi lain. Silakan gunakan nomor urut yang berbeda.`,
              }
            }
            if (msg.includes('psychologists_slug_unique') || msg.includes('slug')) {
              return {
                status: 'badRequest',
                message: `Slug URL "${input.slug}" sudah digunakan oleh praktisi lain. Silakan ganti slug URL agar unik.`,
              }
            }
            return { status: 'badRequest', message: 'Terdapat data duplikat yang melanggar aturan keunikan sistem.' }
          }
          set.status = 500
          return { status: 'error', message: error?.message || 'Failed to update psychologist profile.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Update psychologist profile',
          description: 'Updates an existing psychologist profile with full relations and translations.',
        },
      }
    )
    .patch(
      '/api/admin/psychologists/:id/status',
      async ({ params: { id }, body, set }: any) => {
        const status = body?.status
        if (!status || !PSYCHOLOGIST_LIFECYCLE_STATES.includes(status)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid status value.' }
        }

        if (!dependencies.psychologistsRepository.updateStatusAdmin) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        const psychologist = await dependencies.psychologistsRepository.updateStatusAdmin(id, status)
        if (!psychologist) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        return { status: 'success', psychologist }
      },
      {
        requireRole: ['admin'],
        body: t.Object({
          status: lifecycleStatusSchema
        }),
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Update psychologist status',
          description: 'Updates the lifecycle status of a psychologist (draft, active, inactive, archived).',
        },
      }
    )
    .post(
      '/api/admin/psychologists/upload-photo',
      async ({ body, set }: any) => {
        try {
          const file = body.file
          if (!file) {
            set.status = 400
            return { status: 'badRequest', message: 'File gambar wajib diunggah.' }
          }

          const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
          if (file.size > MAX_PHOTO_SIZE_BYTES) {
            set.status = 413
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            return {
              status: 'payloadTooLarge',
              message: `Ukuran file foto (${sizeMB} MB) melebihi batas maksimal 5 MB.`
            }
          }

          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          if (buffer.length > MAX_PHOTO_SIZE_BYTES) {
            set.status = 413
            return {
              status: 'payloadTooLarge',
              message: 'Ukuran file foto melebihi batas maksimal 5 MB.'
            }
          }

          const detected = extractImageDimensions(buffer)

          const width = detected?.width || (body.width ? Number(body.width) : 600)
          const height = detected?.height || (body.height ? Number(body.height) : 750)
          const mimeType = detected?.mimeType || file.type || 'image/webp'

          // Determine file extension
          let ext = 'webp'
          if (mimeType === 'image/png') ext = 'png'
          else if (mimeType === 'image/jpeg') ext = 'jpg'

          const rawSlug = (body.slug || body.name || 'psychologist').trim().toLowerCase()
          const safeSlug = rawSlug.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'psychologist'
          const filename = `${safeSlug}.${ext}`
          const objectKey = `media/psychologists/${filename}`

          // Storage destination: apps/web/public/media/psychologists
          const storageDir = path.resolve(process.cwd(), 'apps/web/public/media/psychologists')
          fs.mkdirSync(storageDir, { recursive: true })
          fs.writeFileSync(path.join(storageDir, filename), buffer)

          // If apps/web/dist/media/psychologists exists (production / preview build), sync it too
          const distDir = path.resolve(process.cwd(), 'apps/web/dist/media/psychologists')
          if (fs.existsSync(path.resolve(process.cwd(), 'apps/web/dist'))) {
            fs.mkdirSync(distDir, { recursive: true })
            fs.writeFileSync(path.join(distDir, filename), buffer)
          }

          const altId = body.altId || `Foto profil ${body.name || safeSlug}`
          const altEn = body.altEn || `Profile photo of ${body.name || safeSlug}`

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
            message: 'Foto profil psikolog berhasil diunggah!',
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
            message: err?.message || 'Gagal mengunggah foto profil psikolog.'
          }
        }
      },
      {
        requireRole: ['admin'],
        body: t.Object({
          file: t.File(),
          slug: t.Optional(t.String()),
          name: t.Optional(t.String()),
          altId: t.Optional(t.String()),
          altEn: t.Optional(t.String()),
          width: t.Optional(t.Numeric()),
          height: t.Optional(t.Numeric())
        }),
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Upload psychologist profile photo',
          description: 'Uploads, analyzes dimensions, and registers media object for a psychologist profile photo.'
        }
      }
    )
}
