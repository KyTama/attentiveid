import { count, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import * as schema from './schema';
import scholarArticles from '../../../../apps/web/src/data/scholar-articles.json';

interface ScholarArticleFixture {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publicationDate: string;
  year?: number;
  journal: {
    name: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
  abstract: string;
  doi?: string;
  doiUrl?: string;
  citationsCount?: number;
  scholarUrl: string;
}

function parsePublicationDateToIso(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toISOString();
  } else if (parts.length === 2) {
    const [y, m] = parts.map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toISOString();
  } else if (parts.length === 1 && parts[0].length === 4) {
    const y = Number(parts[0]);
    return new Date(Date.UTC(y, 0, 1)).toISOString();
  }
  return new Date().toISOString();
}

function formatArticleBody(art: ScholarArticleFixture): string {
  const lines: string[] = [];
  if (art.abstract) {
    lines.push(art.abstract);
    lines.push('');
  }
  lines.push('---');
  lines.push(`**Authors**: ${art.authors?.join(', ') || 'Haykal Hafizul Arifin'}`);
  if (art.journal?.name) {
    let journalMeta = art.journal.name;
    if (art.journal.volume) journalMeta += `, Vol. ${art.journal.volume}`;
    if (art.journal.issue) journalMeta += `, No. ${art.journal.issue}`;
    if (art.journal.pages) journalMeta += `, pp. ${art.journal.pages}`;
    if (art.journal.publisher) journalMeta += ` (${art.journal.publisher})`;
    lines.push(`**Publication**: ${journalMeta}`);
  }
  if (art.doiUrl) {
    lines.push(`**DOI**: [${art.doi}](${art.doiUrl})`);
  }
  if (art.scholarUrl) {
    lines.push(`**Google Scholar**: [View on Google Scholar](${art.scholarUrl})`);
  }
  return lines.join('\n');
}

export async function seedArticles(database: any, articlesList: ScholarArticleFixture[] = scholarArticles as ScholarArticleFixture[]) {
  return await database.transaction(async (tx: any) => {
    // 1. Find Dr. Haykal psychologist record
    const [haykal] = await tx
      .select({ id: schema.psychologists.id })
      .from(schema.psychologists)
      .where(eq(schema.psychologists.slug, 'haykal'))
      .limit(1);

    if (!haykal) {
      throw new Error('Psychologist with slug "haykal" not found in database. Seed psychologists first.');
    }

    let inserted = 0;
    let updated = 0;

    for (const item of articlesList) {
      const pubDateIso = parsePublicationDateToIso(item.publicationDate);
      const bodyContent = formatArticleBody(item);
      const summaryText = item.abstract || item.title;

      // Check if article with this slug exists
      const [existing] = await tx
        .select()
        .from(schema.articles)
        .where(eq(schema.articles.slug, item.slug))
        .limit(1);

      if (!existing) {
        const articleId = randomUUID();
        const revisionId = randomUUID();

        // 1. Insert article first with null revision pointers to satisfy foreign key constraints
        await tx.insert(schema.articles).values({
          id: articleId,
          ownerPsychologistId: haykal.id,
          slug: item.slug,
          status: 'published',
          publishedRevisionId: null,
          draftRevisionId: null,
          createdAt: pubDateIso,
          updatedAt: pubDateIso,
        });

        // 2. Insert revision referencing articleId
        await tx.insert(schema.articleRevisions).values({
          id: revisionId,
          articleId: articleId,
          revisionNumber: 1,
          status: 'approved',
          titleId: item.title,
          titleEn: item.title,
          summaryId: summaryText,
          summaryEn: summaryText,
          bodyId: bodyContent,
          bodyEn: bodyContent,
          submittedAt: pubDateIso,
          approvedAt: pubDateIso,
        });

        // 3. Link publishedRevisionId on article
        await tx.update(schema.articles)
          .set({ publishedRevisionId: revisionId })
          .where(eq(schema.articles.id, articleId));

        inserted++;
      } else {
        // Update existing article & revision
        let revisionId = existing.publishedRevisionId;
        if (!revisionId) {
          revisionId = randomUUID();
          await tx.insert(schema.articleRevisions).values({
            id: revisionId,
            articleId: existing.id,
            revisionNumber: 1,
            status: 'approved',
            titleId: item.title,
            titleEn: item.title,
            summaryId: summaryText,
            summaryEn: summaryText,
            bodyId: bodyContent,
            bodyEn: bodyContent,
            submittedAt: pubDateIso,
            approvedAt: pubDateIso,
          });
        } else {
          await tx.update(schema.articleRevisions)
            .set({
              titleId: item.title,
              titleEn: item.title,
              summaryId: summaryText,
              summaryEn: summaryText,
              bodyId: bodyContent,
              bodyEn: bodyContent,
              status: 'approved',
              approvedAt: pubDateIso,
            })
            .where(eq(schema.articleRevisions.id, revisionId));
        }

        await tx.update(schema.articles)
          .set({
            ownerPsychologistId: haykal.id,
            status: 'published',
            publishedRevisionId: revisionId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.articles.id, existing.id));

        updated++;
      }
    }

    return { total: articlesList.length, inserted, updated };
  });
}

const runArticlesSeed = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required to seed articles.');
    process.exitCode = 1;
    return;
  }

  const queryClient = postgres(databaseUrl, { max: 1 });
  const database = drizzle(queryClient, { schema });

  try {
    const result = await seedArticles(database);
    console.info(`✅ Successfully seeded articles into PostgreSQL:`);
    console.info(`   - Total Processed: ${result.total}`);
    console.info(`   - Newly Inserted: ${result.inserted}`);
    console.info(`   - Updated: ${result.updated}`);
  } catch (err) {
    console.error('❌ Articles seed failed:', err);
    process.exitCode = 1;
  } finally {
    await queryClient.end();
  }
};

if (import.meta.main) {
  await runArticlesSeed();
}
