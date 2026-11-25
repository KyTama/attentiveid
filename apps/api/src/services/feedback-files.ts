/** Checking attached files and copying a report with its files into Drive. */
import { FEEDBACK_FILE_TYPES, feedbackFileExtension, type FeedbackReport } from '@attentiveid/shared';
import type { FeedbackRepository, FeedbackUpload } from '../repositories/feedback.repository';
import type { DriveRequests } from './drive-reports';

const starts = (data: Buffer, bytes: number[], at = 0) => bytes.every((byte, i) => data[at + i] === byte);
const ascii = (data: Buffer, at: number, length: number) => data.subarray(at, at + length).toString('latin1');

/** Does the content look like what the file ending says? */
export const contentMatches = (extension: string, data: Buffer): boolean => {
    switch (extension) {
        case 'jpg':
        case 'jpeg': return starts(data, [0xff, 0xd8, 0xff]);
        case 'png': return starts(data, [0x89, 0x50, 0x4e, 0x47]);
        case 'gif': return ascii(data, 0, 4) === 'GIF8';
        case 'webp': return ascii(data, 0, 4) === 'RIFF' && ascii(data, 8, 4) === 'WEBP';
        case 'pdf': return ascii(data, 0, 4) === '%PDF';
        case 'mp4':
        case 'mov': return ascii(data, 4, 4) === 'ftyp';
        case 'docx':
        case 'xlsx':
        case 'pptx': return starts(data, [0x50, 0x4b, 0x03, 0x04]);
        case 'txt': return !data.includes(0);
        default: return false;
    }
};

/** A file name that is safe in Drive: no paths or control characters, not too long. */
export const cleanName = (name: string, max = 100): string => {
    // eslint-disable-next-line no-control-regex
    const base = name.split(/[\\/]/).pop()!.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').replace(/\s+/g, ' ').trim();
    if (base.length <= max) return base || 'file';
    const extension = feedbackFileExtension(base);
    return `${base.slice(0, max - extension.length - 1)}.${extension}`;
};

/** Turns checked uploads into stored files; returns null when a file's content does not match its name. */
export const readUploads = async (files: File[]): Promise<FeedbackUpload[] | null> => {
    const used = new Set<string>(['request.txt']);
    const uploads: FeedbackUpload[] = [];
    for (const file of files) {
        const extension = feedbackFileExtension(file.name);
        const data = Buffer.from(await file.arrayBuffer());
        if (!contentMatches(extension, data)) return null;
        // Two files with the same name would overwrite each other in Drive.
        const clean = cleanName(file.name);
        let name = clean;
        for (let n = 2; used.has(name.toLowerCase()); n += 1) name = `${n}-${clean}`;
        used.add(name.toLowerCase());
        uploads.push({ name, mimeType: FEEDBACK_FILE_TYPES[extension], data });
    }
    return uploads;
};

const jakarta = (at: Date) => new Date(at.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ');

/** "2026-11-25 1643 - Bug - Dina (a1b2c3d4)" */
export const requestFolderName = (report: FeedbackReport): string =>
    `${jakarta(new Date(report.createdAt)).replace(':', '')} - ${report.kind === 'bug' ? 'Bug' : 'Saran'} - ${cleanName(report.name, 40)} (${report.id.slice(0, 8)})`;

export const requestSummary = (report: FeedbackReport): string => [
    `Jenis   : ${report.kind === 'bug' ? 'Bug / error' : 'Saran'}`,
    `Nama    : ${report.name}`,
    `Waktu   : ${jakarta(new Date(report.createdAt))} WIB`,
    `Halaman : ${report.page || '-'}`,
    `Berkas  : ${report.files.map((file) => file.name).join(', ') || '-'}`,
    '',
    report.message,
    ''
].join('\r\n');

/** Copies one report into Drive and empties the stored files. Records the reason when it fails. */
export const copyReportToDrive = async (id: string, repository: FeedbackRepository, drive: DriveRequests): Promise<boolean> => {
    try {
        const report = await repository.get(id);
        if (!report) return false;
        const files = await repository.pendingFiles(id);
        const saved = await drive.saveRequest({
            folderName: requestFolderName(report),
            at: new Date(report.createdAt),
            files: [
                { name: 'Request.txt', mimeType: 'text/plain', data: requestSummary(report) },
                ...files.map((file) => ({ name: file.name, mimeType: file.mimeType, data: new Uint8Array(file.data) }))
            ]
        });
        await repository.markCopied(id, saved.folderId);
        return true;
    } catch (error) {
        const reason = error instanceof Error ? error.message : 'error';
        console.error('[feedback] Drive copy failed:', reason);
        await repository.markCopyFailed(id, reason).catch(() => undefined);
        return false;
    }
};
