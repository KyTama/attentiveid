import { describe, expect, test } from 'bun:test';
import { seedArticles } from './seed-articles';

describe('seedArticles', () => {
  test('throws if psychologist "haykal" is not found in database', async () => {
    const mockDb = {
      transaction: async (cb: any) => {
        const tx = {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: async () => [],
              }),
            }),
          }),
        };
        return cb(tx);
      },
    };

    await expect(seedArticles(mockDb, [])).rejects.toThrow(
      'Psychologist with slug "haykal" not found in database'
    );
  });

  test('successfully processes fixture items and tracks inserts vs updates', async () => {
    const insertedArticles: any[] = [];
    const insertedRevisions: any[] = [];
    const updatedArticles: any[] = [];

    let queryCount = 0;

    const mockDb = {
      transaction: async (cb: any) => {
        const tx = {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: async () => {
                  queryCount++;
                  // First query is for psychologist 'haykal'
                  if (queryCount === 1) {
                    return [{ id: 'mock-haykal-id' }];
                  }
                  // Subsequent queries check for existing articles
                  return [];
                },
              }),
            }),
          }),
          insert: () => ({
            values: async (data: any) => {
              if (data.ownerPsychologistId !== undefined) {
                insertedArticles.push(data);
              } else {
                insertedRevisions.push(data);
              }
            },
          }),
          update: () => ({
            set: (data: any) => ({
              where: async () => {
                updatedArticles.push(data);
              },
            }),
          }),
        };
        return cb(tx);
      },
    };

    const mockFixture = [
      {
        id: 'item-1',
        slug: 'test-article-1',
        title: 'Test Title 1',
        authors: ['Haykal Hafizul Arifin'],
        publicationDate: '2023/05/10',
        journal: { name: 'Jurnal Psikologi' },
        abstract: 'Test abstract',
        scholarUrl: 'https://scholar.google.com',
      },
    ];

    const result = await seedArticles(mockDb, mockFixture);
    expect(result.total).toBe(1);
    expect(result.inserted).toBe(1);
    expect(insertedArticles.length).toBe(1);
    expect(insertedArticles[0].slug).toBe('test-article-1');
    expect(insertedArticles[0].publishedRevisionId).toBeNull();
    expect(insertedRevisions.length).toBe(1);
    expect(insertedRevisions[0].articleId).toBe(insertedArticles[0].id);
    expect(updatedArticles.length).toBe(1);
    expect(updatedArticles[0].publishedRevisionId).toBe(insertedRevisions[0].id);
  });

  test('insert-only mode leaves an article that already exists untouched', async () => {
    const writes: string[] = [];
    let queryCount = 0;
    const mockDb = {
      transaction: async (cb: any) =>
        cb({
          select: () => ({
            from: () => ({
              where: () => ({
                limit: async () => {
                  queryCount++;
                  return queryCount === 1 ? [{ id: 'haykal-id' }] : queryCount === 2 ? [] : [{ id: 'existing', publishedRevisionId: 'rev' }];
                },
              }),
            }),
          }),
          insert: () => ({ values: async () => void writes.push('insert') }),
          update: () => ({ set: () => ({ where: async () => void writes.push('update') }) }),
        }),
    };
    const item = (slug: string) => ({
      id: slug,
      slug,
      title: slug,
      authors: ['Haykal Hafizul Arifin'],
      publicationDate: '2023/05/10',
      journal: { name: 'J' },
      abstract: 'a',
      scholarUrl: 'https://scholar.google.com',
    });
    // queryCount: 1 = haykal, 2 = jessica lookup, 3.. = slug checks
    const result = await seedArticles(mockDb, [item('already-there')], { overwriteExisting: false });
    expect(result).toEqual({ total: 1, inserted: 0, updated: 0, skipped: 1 });
    expect(writes).toEqual([]);
  });
});
