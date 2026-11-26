import { describe, expect, it } from 'bun:test';
import { guessFeedbackKind, type FeedbackReport } from '@attentiveid/shared';
import { createFeedbackSheet, FEEDBACK_SHEET_HEADERS } from './feedback-sheet';

const report = (id: string, extra: Partial<FeedbackReport> = {}): FeedbackReport => ({
    id: `${id}-0000`, kind: 'bug', name: 'Dina', message: 'Tombol rusak sekali.', page: '/x', createdAt: '2026-11-26T01:00:00Z',
    status: 'in_progress', assignee: 'a@b.c', doneAt: null, files: [], notes: [], log: [], driveFolderId: null, driveError: null, ...extra
});

describe('feedback sheet mirror', () => {
    it('writes a header and one row per report, oldest first', async () => {
        let rows: string[][] = [];
        const sheet = createFeedbackSheet(async () => [report('new'), report('old')], {
            replaceRequestSheet: async (input) => { rows = input.rows; return { spreadsheetId: 'abc' }; }
        });
        expect(sheet.url()).toBe('');
        await sheet.sync();
        expect(rows[0]).toEqual(FEEDBACK_SHEET_HEADERS);
        expect(rows.slice(1).map((row) => row[0])).toEqual(['old-0000', 'new-0000']);
        expect(rows[1].slice(2, 5)).toEqual(['Bug', 'On progress', 'a@b.c']);
        expect(sheet.url()).toBe('https://docs.google.com/spreadsheets/d/abc');
    });

    it('joins requests that arrive together and survives a Google failure', async () => {
        let writes = 0;
        const errors: unknown[] = [];
        const sheet = createFeedbackSheet(async () => [], {
            replaceRequestSheet: async () => { writes += 1; if (writes === 1) throw new Error('quota'); await Bun.sleep(5); return { spreadsheetId: 'abc' }; }
        }, (error) => errors.push(error));
        await Promise.all([sheet.sync(), sheet.sync(), sheet.sync()]);
        expect(writes).toBe(2);
        expect(errors).toHaveLength(1);
    });
});

describe('guessing bug or suggestion', () => {
    it('answers only when the text points one way', () => {
        expect(guessFeedbackKind('the session timer is not working')).toBe('bug');
        expect(guessFeedbackKind('perlu ada opsi upload foto')).toBe('suggestion');
        expect(guessFeedbackKind('tambahkan tombol karena yang lama rusak')).toBeNull();
        expect(guessFeedbackKind('halaman depan')).toBeNull();
    });
});
