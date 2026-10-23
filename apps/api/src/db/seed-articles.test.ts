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
});
