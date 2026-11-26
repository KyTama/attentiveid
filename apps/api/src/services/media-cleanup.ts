import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { deleteVersionedMediaFile, isVersionedMediaObjectKey } from './media-storage';

// Hero slides keep their pictures inside saved JSON, not in media_attachments. A file that any saved landing revision still
// mentions is in use, whatever the attachment table says.
const notMentionedInContent = sql`not exists (
  select 1 from ${schema.landingSectionTranslations}
  where position(${schema.mediaObjects.objectKey} in coalesce(${schema.landingSectionTranslations.contact}, '')) > 0
)`;

const ABANDONED_UPLOAD_TTL_MS = 60 * 60 * 1000; // 1 hour grace window for active editing sessions
const CLEANUP_THROTTLE_MS = 10 * 60 * 1000;

let lastSweepAt = 0;

/**
 * Reclaims unattached versioned uploads older than the grace window so repeated
 * cancelled uploads do not accumulate on VPS storage.
 */
export async function sweepAbandonedVersionedMedia(
  db: PostgresJsDatabase<typeof schema>,
  options: { nowMs?: number; ttlMs?: number; force?: boolean } = {}
): Promise<number> {
  if (typeof (db as { delete?: unknown })?.delete !== 'function') {
    return 0;
  }
  const nowMs = options.nowMs ?? Date.now();
  if (!options.force && nowMs - lastSweepAt < CLEANUP_THROTTLE_MS) {
    return 0;
  }
  lastSweepAt = nowMs;

  const cutoffIso = new Date(nowMs - (options.ttlMs ?? ABANDONED_UPLOAD_TTL_MS)).toISOString();

  try {
    const candidates = await db
      .select({
        id: schema.mediaObjects.id,
        objectKey: schema.mediaObjects.objectKey,
      })
      .from(schema.mediaObjects)
      .where(and(
        eq(schema.mediaObjects.lifecycle, 'active'),
        lt(schema.mediaObjects.createdAt, cutoffIso),
        sql`not exists (
          select 1 from ${schema.mediaAttachments}
          where ${schema.mediaAttachments.mediaObjectId} = ${schema.mediaObjects.id}
        )`,
        notMentionedInContent
      ))
      .limit(50);

    const versioned = candidates.filter(
      (row): row is { id: string; objectKey: string } =>
        Boolean(row.objectKey && isVersionedMediaObjectKey(row.objectKey))
    );
    if (versioned.length === 0) return 0;

    const deletedIds: string[] = [];
    for (const row of versioned) {
      deleteVersionedMediaFile(row.objectKey);
      deletedIds.push(row.id);
    }

    await db
      .delete(schema.mediaObjects)
      .where(and(
        inArray(schema.mediaObjects.id, deletedIds),
        sql`not exists (
          select 1 from ${schema.mediaAttachments}
          where ${schema.mediaAttachments.mediaObjectId} = ${schema.mediaObjects.id}
        )`,
        notMentionedInContent
      ));

    return deletedIds.length;
  } catch {
    return 0;
  }
}
