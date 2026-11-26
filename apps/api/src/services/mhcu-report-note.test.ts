import { describe, expect, it } from 'bun:test';
import { MHCU_LEVELS } from '@attentiveid/shared';
import { NOTE_ONLY_IN_OTHER_LANGUAGE, recommendationOf } from './mhcu-report-service';

const note = (o: Partial<Record<'noteTemplate' | 'noteCustom' | 'noteTemplateEn' | 'noteCustomEn', string | null>> = {}) => ({
    noteTemplate: null,
    noteCustom: null,
    noteTemplateEn: null,
    noteCustomEn: null,
    ...o
});

describe('the recommendation paragraph per language', () => {
    it('is the standard text of the level in each language when the psychologist wrote nothing', () => {
        expect(recommendationOf(note(), 3, 'id')).toBe(MHCU_LEVELS[3].actionId);
        expect(recommendationOf(note(), 3, 'en')).toBe(MHCU_LEVELS[3].actionEn);
    });

    it('uses only the text written for that language', () => {
        const both = note({ noteTemplate: 'Rekomendasi.', noteCustom: 'Catatan.', noteTemplateEn: 'Advice.', noteCustomEn: 'Note.' });
        expect(recommendationOf(both, 2, 'id')).toBe('Rekomendasi. Catatan.');
        expect(recommendationOf(both, 2, 'en')).toBe('Advice. Note.');
    });

    it('English with an empty English field: standard English text plus the pointer, no Indonesian words', () => {
        const text = recommendationOf(note({ noteCustom: 'Tidur lebih teratur.' }), 4, 'en');
        expect(text).toBe(`${MHCU_LEVELS[4].actionEn} ${NOTE_ONLY_IN_OTHER_LANGUAGE.en}`);
        expect(text).not.toContain('Tidur');
    });

    it('an edited Indonesian paragraph without an English version also gets the pointer', () => {
        expect(recommendationOf(note({ noteTemplate: 'Teks sendiri.' }), 1, 'en')).toBe(`${MHCU_LEVELS[1].actionEn} ${NOTE_ONLY_IN_OTHER_LANGUAGE.en}`);
    });

    it('half translated: prints what is there and still says there is more', () => {
        const text = recommendationOf(note({ noteTemplate: 'Teks.', noteCustom: 'Catatan.', noteCustomEn: 'Note.' }), 2, 'en');
        expect(text).toBe(`${MHCU_LEVELS[2].actionEn} Note. ${NOTE_ONLY_IN_OTHER_LANGUAGE.en}`);
    });

    it('works the other way round: an English-only note is not silently dropped from the Indonesian report', () => {
        const text = recommendationOf(note({ noteCustomEn: 'Only English.' }), 2, 'id');
        expect(text).toBe(`${MHCU_LEVELS[2].actionId} ${NOTE_ONLY_IN_OTHER_LANGUAGE.id}`);
    });

    it('blank text counts as empty', () => {
        expect(recommendationOf(note({ noteCustom: '   ', noteCustomEn: '  ' }), 2, 'en')).toBe(MHCU_LEVELS[2].actionEn);
    });
});
