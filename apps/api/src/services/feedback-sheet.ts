/** The Google Sheet that mirrors the reports: one row each, rewritten from the website after every change (one way only). */
import { FEEDBACK_STATUS_LABELS, type FeedbackReport } from '@attentiveid/shared';
import type { DriveRequests } from './drive-reports';
import { toJakartaIso } from './free-session-sheet';

export const FEEDBACK_SHEET_TITLE = 'Feedback Reports';
export const FEEDBACK_SHEET_TAB = 'Reports';

export const FEEDBACK_SHEET_HEADERS = [
    'ID', 'Received (WIB)', 'Type', 'Status', 'Processed by', 'Name', 'Page', 'Message', 'Files', 'Notes', 'Drive folder', 'Last change (WIB)'
];

export const feedbackSheetRow = (report: FeedbackReport): string[] => [
    report.id.slice(0, 8),
    toJakartaIso(report.createdAt),
    report.kind === 'bug' ? 'Bug' : 'Suggestion',
    FEEDBACK_STATUS_LABELS[report.status].en,
    report.assignee,
    report.name,
    report.page,
    report.message,
    [...report.files, ...report.notes.flatMap((note) => note.files)].map((file) => file.name).join(', '),
    report.notes.map((note) => `${note.author}: ${note.body}`.trim()).join('\n').slice(0, 40000),
    report.driveFolderId ? `https://drive.google.com/drive/folders/${report.driveFolderId}` : '',
    toJakartaIso(report.log.at(-1)?.at ?? report.createdAt)
];

export interface FeedbackSheet {
    /** Asks for a rewrite; several requests close together become one. Never throws. */
    sync(): Promise<void>;
    url(): string;
}

export const createFeedbackSheet = (
    list: () => Promise<FeedbackReport[]>,
    drive: Pick<DriveRequests, 'replaceRequestSheet'>,
    onError: (error: unknown) => void = (error) => console.error('[feedback] Sheet mirror failed:', error instanceof Error ? error.message : 'error')
): FeedbackSheet => {
    let spreadsheetId = '';
    let running: Promise<void> | null = null;
    let again = false;

    const write = async () => {
        do {
            again = false;
            try {
                const reports = await list();
                // Oldest first, so new reports are added at the bottom.
                const rows = [FEEDBACK_SHEET_HEADERS, ...[...reports].reverse().map(feedbackSheetRow)];
                spreadsheetId = (await drive.replaceRequestSheet({ title: FEEDBACK_SHEET_TITLE, tab: FEEDBACK_SHEET_TAB, rows })).spreadsheetId;
            } catch (error) {
                onError(error);
            }
        } while (again);
    };

    return {
        sync() {
            if (running) {
                again = true;
                return running;
            }
            running = write().finally(() => {
                running = null;
            });
            return running;
        },
        url: () => (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : '')
    };
};
