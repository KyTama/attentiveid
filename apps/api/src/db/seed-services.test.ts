import { describe, expect, it } from 'bun:test';
import {
    bootstrapServices,
    internalCategorySeedFixtures,
    internalCostSeedFixtures,
    internalServiceSeedFixtures,
    serviceCategorySeedFixtures,
    serviceDataIssueSeedFixtures,
    serviceProgramSeedFixtures,
    serviceSeedFixtures
} from './seed-services';

describe('seed-services fixtures & bootstrap', () => {
    it('contains only published public non-archived services and variants without internal cost data', () => {
        expect(serviceCategorySeedFixtures.length).toBe(5);
        expect(serviceSeedFixtures.length).toBe(26);
        expect(serviceProgramSeedFixtures.length).toBe(1);

        const variantSlugs = serviceSeedFixtures.flatMap((s) => s.variants.map((v) => v.slug));
        expect(variantSlugs).not.toContain('v-acm-x');
        expect(variantSlugs).not.toContain('v-kd-chat');
        expect(variantSlugs).not.toContain('v-mmpi-group');

        const newClientFeeSlugs = serviceSeedFixtures.filter((s) => s.appliesNewClientFee).map((s) => s.slug);
        expect(newClientFeeSlugs).toEqual(['konseling-dewasa']);

        const konselingAnak = serviceSeedFixtures.find((s) => s.slug === 'konseling-anak');
        expect(konselingAnak?.psychologists.map((p) => p.slug)).toContain('gisella');

        const konselingDewasa = serviceSeedFixtures.find((s) => s.slug === 'konseling-dewasa');
        const dewasaPsychSlugs = konselingDewasa?.psychologists.map((p) => p.slug) ?? [];
        expect(dewasaPsychSlugs).toContain('nichi');
        expect(dewasaPsychSlugs).toContain('mayda');

        const kesiapanSekolah = serviceSeedFixtures.find((s) => s.slug === 'kesiapan-sekolah');
        expect(kesiapanSekolah?.translations.id.assessmentMethod).toBeNull();
    });

    it('skips seeding when services table is already populated', async () => {
        const fakeDb = {
            select: () => ({
                from: () => Promise.resolve([{ total: 26 }])
            })
        } as any;

        const res = await bootstrapServices(fakeDb);
        expect(res.status).toBe('alreadyInitialized');
    });

    it('separates all 27 non-published/internal services, 351 cost records, and 38 issues into isolated internal fixtures', () => {
        expect(serviceCategorySeedFixtures.length + internalCategorySeedFixtures.length).toBe(8);
        expect(serviceSeedFixtures.length + internalServiceSeedFixtures.length).toBe(53);
        expect(internalCostSeedFixtures.length).toBe(351);
        expect(serviceDataIssueSeedFixtures.length).toBe(38);
    });
});
