import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { FeedbackReport, FeedbackSubmission, UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { FeedbackChange, FeedbackEventInput, FeedbackRepository, PendingFeedbackFile } from '../repositories/feedback.repository';
import type { DriveRequests } from '../services/drive-reports';
import { createFeedbackRoutes } from './feedback.routes';

const tokenService = createTokenService({ jwtSecret: 'feedback_test_secret_that_is_long_enough_123456' });
const user = (id: string, email: string, role: UserDto['role']): UserDto => ({ id, email, name: id, role, status: 'active', psychologistId: null } as UserDto);
const owner = user('owner', 'nico.alex.ha@gmail.com', 'superadmin');
const otherSuper = user('other-super', 'someone@example.test', 'superadmin');
const admin = user('admin', 'admin@example.test', 'admin');
const handler = user('handler', 'kytama@attentiveid.com', 'admin');
const psychologist = user('psy', 'ibrohimaji31@gmail.com', 'psychologist' as UserDto['role']);
const users = new Map([owner, otherSuper, admin, handler, psychologist].map((u) => [u.id, u]));
const bearer = (u: UserDto) => ({ authorization: `Bearer ${tokenService.issueAccessToken(u).accessToken}` });

const ID = '11111111-1111-1111-1111-111111111111';

const make = () => {
    const created: FeedbackSubmission[] = [];
    const changes: FeedbackChange[] = [];
    const events: FeedbackEventInput[] = [];
    const notes: Array<{ author: string; body: string; names: string[] }> = [];
    const deleted: string[] = [];
    const uploads: PendingFeedbackFile[][] = [];
    let synced = 0;
    const stored = new Map<string, FeedbackReport>();
    const copied: string[] = [];
    const repository: FeedbackRepository = {
        create: async (value, files, initial) => {
            created.push(value);
            events.push(...initial);
            uploads.push(files.map((file, i) => ({ ...file, id: String(i) })));
            stored.set(ID, {
                ...value, id: ID, createdAt: '2026-11-25T09:43:00Z', doneAt: null, driveFolderId: null, driveError: null,
                status: 'new', assignee: '', notes: [], log: [],
                files: files.map((file) => ({ name: file.name, size: file.data.length }))
            });
            return { id: ID };
        },
        list: async () => [] as FeedbackReport[],
        get: async (id) => stored.get(id) ?? null,
        pendingFiles: async () => uploads[uploads.length - 1] ?? [],
        pendingBytes: async () => 0,
        markCopied: async (_id, folderId) => { copied.push(folderId); },
        markCopyFailed: async (id, error) => { const report = stored.get(id); if (report) report.driveError = error; },
        update: async (id, change, recorded) => {
            changes.push(change);
            events.push(...recorded);
            const report = stored.get(id);
            if (report) Object.assign(report, change);
        },
        addNote: async (_id, note, files) => { notes.push({ ...note, names: files.map((file) => file.name) }); uploads.push(files.map((file, i) => ({ ...file, id: `n${i}` }))); },
        delete: async (id) => { deleted.push(id); return id === ID; }
    };
    const driven: Array<{ folderName: string; names: string[] }> = [];
    const driveRequests: DriveRequests = {
        ensureRequestFolder: async () => 'top',
        saveRequest: async (input) => { driven.push({ folderName: input.folderName, names: input.files.map((file) => file.name) }); return { folderId: 'folder-1' }; },
        replaceRequestSheet: async () => ({ spreadsheetId: 'x' })
    };
    const app = new Elysia().use(createFeedbackRoutes({
        driveRequests,
        sheet: { sync: async () => { synced += 1; }, url: () => 'https://docs.google.com/spreadsheets/d/x' },
        tokenService,
        userRepository: { findById: async (id: string) => users.get(id) ?? null },
        feedbackRepository: repository,
        updateLog: [{ id: 'abc', at: '2026-11-25T00:00:00Z', author: 'A', title: 'T', detail: '' }]
    }));
    const call = (method: string, path: string, headers: Record<string, string> = {}, body?: unknown) =>
        app.handle(new Request(`http://localhost${path}`, {
            method,
            headers: body instanceof FormData ? headers : { ...headers, 'content-type': 'application/json' },
            body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body)
        }));
    const upload = (files: File[]) => {
        const form = new FormData();
        for (const [key, value] of Object.entries(good)) form.append(key, value);
        for (const file of files) form.append('files', file);
        return app.handle(new Request('http://localhost/api/public/feedback', { method: 'POST', body: form }));
    };
    return { call, created, changes, events, notes, deleted, uploads, driven, copied, upload, stored, synced: () => synced };
};

const good = { kind: 'bug', name: 'Dina', message: 'Tombol di halaman layanan tidak bisa diklik.', page: '/our-services' };

describe('feedback', () => {
    it('lets anyone send a report with a name, and nothing without one', async () => {
        const { call, created } = make();
        expect((await call('POST', '/api/public/feedback', {}, { ...good, name: ' ' })).status).toBe(400);
        expect((await call('POST', '/api/public/feedback', {}, good)).status).toBe(201);
        expect(created).toEqual([good]);
    });

    it('accepts attached files and copies them, with the request, into its own Drive folder', async () => {
        const { upload, uploads, driven, copied } = make();
        const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2])], '../../layar.png');
        const same = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 3])], 'layar.png');
        expect((await upload([png, same])).status).toBe(201);
        expect(uploads[0].map((file) => file.name)).toEqual(['layar.png', '2-layar.png']);
        await Bun.sleep(20);
        expect(driven).toEqual([{ folderName: '2026-11-25 1643 - Bug - Dina (11111111)', names: ['Request.txt', 'layar.png', '2-layar.png'] }]);
        expect(copied).toEqual(['folder-1']);
    });

    it('accepts a single file, and refuses wrong types, disguised content and too many files', async () => {
        const { upload, created } = make();
        const text = (name: string, body = 'halo') => new File([body], name);
        expect((await upload([text('catatan.txt')])).status).toBe(201);
        expect((await upload([text('virus.exe')])).status).toBe(400);
        expect((await upload([text('palsu.png')])).status).toBe(400);
        expect((await upload([text('a.txt'), text('b.txt'), text('c.txt'), text('d.txt')])).status).toBe(400);
        expect(created).toHaveLength(1);
    });

    it('drops bot submissions and slows repeated ones', async () => {
        const { call, created } = make();
        expect((await call('POST', '/api/public/feedback', {}, { ...good, website: 'http://spam' })).status).toBe(201);
        expect(created).toHaveLength(0);
        const statuses: number[] = [];
        for (let i = 0; i < 6; i += 1) statuses.push((await call('POST', '/api/public/feedback', { 'x-forwarded-for': '1.2.3.4' }, good)).status);
        expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
    });

    it('lets admins read, only the named people change, and only the owner delete', async () => {
        const { call, changes, deleted } = make();
        await call('POST', '/api/public/feedback', {}, good);
        for (const u of [owner, otherSuper, admin, handler]) expect((await call('GET', '/api/admin/feedback', bearer(u))).status).toBe(200);
        expect((await call('GET', '/api/admin/feedback')).status).toBe(401);
        expect((await call('GET', '/api/admin/feedback', bearer(psychologist))).status).toBe(403);
        const board = async (u: UserDto) => ((await (await call('GET', '/api/admin/feedback', bearer(u))).json()) as { data: { canHandle: boolean; canDelete: boolean } }).data;
        expect(await board(admin)).toMatchObject({ canHandle: false, canDelete: false });
        expect(await board(handler)).toMatchObject({ canHandle: true, canDelete: false });
        expect(await board(owner)).toMatchObject({ canHandle: true, canDelete: true });
        for (const u of [admin, otherSuper, psychologist]) {
            expect((await call('PUT', `/api/admin/feedback/${ID}`, bearer(u), { status: 'done' })).status).toBe(403);
            expect((await call('POST', `/api/admin/feedback/${ID}/notes`, bearer(u), { body: 'halo' })).status).toBe(403);
        }
        expect(changes).toHaveLength(0);
        expect((await call('DELETE', `/api/admin/feedback/${ID}`, bearer(handler))).status).toBe(403);
        expect(deleted).toHaveLength(0);
        expect((await call('DELETE', `/api/admin/feedback/${ID}`, bearer(owner))).status).toBe(200);
    });

    it('records who changed what, takes the report for whoever starts it, and mirrors to the sheet', async () => {
        const { call, changes, events, synced } = make();
        await call('POST', '/api/public/feedback', {}, good);
        await Bun.sleep(20);
        const before = synced();
        const put = (body: unknown) => call('PUT', `/api/admin/feedback/${ID}`, bearer(handler), body);
        expect((await put({ status: 'finished' })).status).toBe(400);
        expect((await put({ assignee: 'admin@example.test' })).status).toBe(400);
        expect((await put({})).status).toBe(400);
        expect((await call('PUT', '/api/admin/feedback/not-an-id', bearer(handler), { status: 'done' })).status).toBe(404);
        expect((await put({ status: 'in_progress' })).status).toBe(200);
        expect(changes).toEqual([{ status: 'in_progress', assignee: 'kytama@attentiveid.com' }]);
        expect((await put({ kind: 'suggestion' })).status).toBe(200);
        expect(events.map((event) => [event.action, event.detail ?? ''])).toEqual([
            ['received', ''], ['status', 'new > in_progress'], ['assignee', '- > kytama@attentiveid.com'], ['kind', 'bug > suggestion']
        ]);
        expect(events.at(-1)?.actor).toBe('kytama@attentiveid.com');
        expect(synced()).toBe(before + 2);
    });

    it('lets a handler take a report for their own account only', async () => {
        const { call, changes } = make();
        await call('POST', '/api/public/feedback', {}, good);
        const put = (as: Record<string, string>, assignee: string) => call('PUT', `/api/admin/feedback/${ID}`, as, { assignee });
        expect((await put(bearer(handler), 'nico.alex.ha@gmail.com')).status).toBe(400);
        expect((await put(bearer(handler), 'kytama@attentiveid.com')).status).toBe(200);
        expect(changes).toEqual([{ assignee: 'kytama@attentiveid.com' }]);
        expect((await put(bearer(handler), '')).status).toBe(200);
        expect(changes.at(-1)).toEqual({ assignee: '' });
    });

    it('adds notes with files into the report’s Drive folder', async () => {
        const { call, upload, notes, driven } = make();
        await upload([new File(['halo'], 'catatan.txt')]);
        await Bun.sleep(20);
        expect((await call('POST', `/api/admin/feedback/${ID}/notes`, bearer(handler), { body: '  ' })).status).toBe(400);
        const form = new FormData();
        form.append('body', 'Sudah dicek');
        form.append('files', new File(['isi'], 'catatan.txt'));
        const response = await call('POST', `/api/admin/feedback/${ID}/notes`, bearer(handler), form);
        expect(response.status).toBe(201);
        // The name already used by the report is changed, so the first file is not overwritten.
        expect(notes).toEqual([{ author: 'kytama@attentiveid.com', body: 'Sudah dicek', names: ['2-catatan.txt'] }]);
        expect(driven).toHaveLength(2);
    });

    it('corrects the type when the text clearly says otherwise, and keeps a record', async () => {
        const { call, created, events } = make();
        await call('POST', '/api/public/feedback', {}, { ...good, message: 'Tolong tambahkan tombol kembali ke atas.' });
        expect(created[0].kind).toBe('suggestion');
        expect(events[1]).toEqual({ actor: '', action: 'auto_kind', detail: 'bug > suggestion' });
    });

    it('serves the update history to signed-in admins only', async () => {
        const { call } = make();
        expect((await call('GET', '/api/admin/update-log')).status).toBe(401);
        const response = await call('GET', '/api/admin/update-log', bearer(admin));
        expect(((await response.json()) as { data: Array<{ title: string }> }).data[0].title).toBe('T');
    });
});
