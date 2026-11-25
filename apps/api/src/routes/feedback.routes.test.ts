import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { FeedbackReport, FeedbackSubmission, UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { FeedbackRepository, FeedbackUpload } from '../repositories/feedback.repository';
import type { DriveRequests } from '../services/drive-reports';
import { createFeedbackRoutes } from './feedback.routes';

const tokenService = createTokenService({ jwtSecret: 'feedback_test_secret_that_is_long_enough_123456' });
const user = (id: string, email: string, role: UserDto['role']): UserDto => ({ id, email, name: id, role, status: 'active', psychologistId: null } as UserDto);
const owner = user('owner', 'nico.alex.ha@gmail.com', 'superadmin');
const otherSuper = user('other-super', 'someone@example.test', 'superadmin');
const admin = user('admin', 'admin@example.test', 'admin');
const users = new Map([owner, otherSuper, admin].map((u) => [u.id, u]));
const bearer = (u: UserDto) => ({ authorization: `Bearer ${tokenService.issueAccessToken(u).accessToken}` });

const ID = '11111111-1111-1111-1111-111111111111';

const make = () => {
    const created: FeedbackSubmission[] = [];
    const done: Array<[string, boolean]> = [];
    const deleted: string[] = [];
    const uploads: FeedbackUpload[][] = [];
    const stored = new Map<string, FeedbackReport>();
    const copied: string[] = [];
    const repository: FeedbackRepository = {
        create: async (value, files) => {
            created.push(value);
            uploads.push(files);
            stored.set(ID, {
                ...value, id: ID, createdAt: '2026-11-25T09:43:00Z', doneAt: null, driveFolderId: null, driveError: null,
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
        setDone: async (id, value) => { done.push([id, value]); return id === ID; },
        delete: async (id) => { deleted.push(id); return id === ID; }
    };
    const driven: Array<{ folderName: string; names: string[] }> = [];
    const driveRequests: DriveRequests = {
        ensureRequestFolder: async () => 'top',
        saveRequest: async (input) => { driven.push({ folderName: input.folderName, names: input.files.map((file) => file.name) }); return { folderId: 'folder-1' }; }
    };
    const app = new Elysia().use(createFeedbackRoutes({
        driveRequests,
        tokenService,
        userRepository: { findById: async (id: string) => users.get(id) ?? null },
        feedbackRepository: repository,
        updateLog: [{ id: 'abc', at: '2026-11-25T00:00:00Z', author: 'A', title: 'T', detail: '' }]
    }));
    const call = (method: string, path: string, headers: Record<string, string> = {}, body?: unknown) =>
        app.handle(new Request(`http://localhost${path}`, {
            method,
            headers: { ...headers, 'content-type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body)
        }));
    const upload = (files: File[]) => {
        const form = new FormData();
        for (const [key, value] of Object.entries(good)) form.append(key, value);
        for (const file of files) form.append('files', file);
        return app.handle(new Request('http://localhost/api/public/feedback', { method: 'POST', body: form }));
    };
    return { call, created, done, deleted, uploads, driven, copied, upload };
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

    it('shows, marks and deletes reports for the owner account only', async () => {
        const { call, done, deleted } = make();
        for (const [method, path, body] of [['GET', '/api/admin/feedback'], ['PUT', `/api/admin/feedback/${ID}`, { done: true }], ['DELETE', `/api/admin/feedback/${ID}`]] as const) {
            expect((await call(method, path, {}, body)).status).toBe(401);
            expect((await call(method, path, bearer(admin), body)).status).toBe(403);
            expect((await call(method, path, bearer(otherSuper), body)).status).toBe(403);
        }
        expect(done).toHaveLength(0);
        expect(deleted).toHaveLength(0);
        expect((await call('GET', '/api/admin/feedback', bearer(owner))).status).toBe(200);
        expect((await call('PUT', `/api/admin/feedback/${ID}`, bearer(owner), { done: true })).status).toBe(200);
        expect(done).toEqual([[ID, true]]);
        expect((await call('PUT', '/api/admin/feedback/not-an-id', bearer(owner), { done: true })).status).toBe(404);
        expect((await call('DELETE', `/api/admin/feedback/${ID}`, bearer(owner))).status).toBe(200);
    });

    it('serves the update history to signed-in admins only', async () => {
        const { call } = make();
        expect((await call('GET', '/api/admin/update-log')).status).toBe(401);
        const response = await call('GET', '/api/admin/update-log', bearer(admin));
        expect(((await response.json()) as { data: Array<{ title: string }> }).data[0].title).toBe('T');
    });
});
