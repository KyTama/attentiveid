import { describe, expect, test } from 'bun:test';
import { validateLandingContentMutation, type LandingContentMutation } from '@attentiveid/shared';
import {
    landingSeedContent,
    seedLanding,
    type LandingSeedDatabase
} from './seed-landing';

class MemoryLandingSeedDatabase implements LandingSeedDatabase {
    calls = 0;
    publishedContent: LandingContentMutation | null = null;

    constructor(
        private readonly result: 'seeded' | 'unchanged' = 'seeded',
        private readonly failureMessage?: string
    ) {}

    async bootstrap(content: typeof landingSeedContent) {
        this.calls += 1;
        if (this.failureMessage) throw new Error(this.failureMessage);
        if (this.result === 'seeded') this.publishedContent = structuredClone(content);
        return this.result;
    }
}

describe('landing seed bootstrap', () => {
    test('publishes complete bilingual managed content through one atomic bootstrap operation', async () => {
        const database = new MemoryLandingSeedDatabase();

        await expect(seedLanding(database)).resolves.toEqual({ status: 'seeded' });
        expect(database.calls).toBe(1);
        expect(database.publishedContent).toEqual(landingSeedContent);
        expect(validateLandingContentMutation(database.publishedContent)).toBe(true);
        expect(landingSeedContent.sections[0].items).toHaveLength(4);
        expect(landingSeedContent.sections[6].price).toEqual({ id: 'Rp475.000', en: 'IDR 475,000' });
    });

    test('is repeatable and preserves an existing published revision or active draft', async () => {
        const database = new MemoryLandingSeedDatabase('unchanged');

        await expect(seedLanding(database)).resolves.toEqual({ status: 'unchanged' });
        await expect(seedLanding(database)).resolves.toEqual({ status: 'unchanged' });
        expect(database.calls).toBe(2);
        expect(database.publishedContent).toBeNull();
    });

    test('rejects invalid fixture data before touching the database', async () => {
        const database = new MemoryLandingSeedDatabase();
        const invalidContent = structuredClone(landingSeedContent);
        Reflect.deleteProperty(invalidContent.sections[0], 'items');

        await expect(seedLanding(database, invalidContent)).rejects.toThrow('Invalid landing seed content.');
        expect(database.calls).toBe(0);
    });

    test('redacts database failures and stays independent from browser assets', async () => {
        const database = new MemoryLandingSeedDatabase(
            'seeded',
            'postgresql://fixture-user:fixture-password@db.example.invalid/attentive'
        );

        await expect(seedLanding(database)).rejects.toThrow('Landing seed failed.');

        const source = await Bun.file(new URL('./seed-landing.ts', import.meta.url)).text();
        expect(source).not.toContain('fixture-user');
        expect(source).not.toContain('apps/web');
        expect(source).not.toContain('@/assets');
    });
});
