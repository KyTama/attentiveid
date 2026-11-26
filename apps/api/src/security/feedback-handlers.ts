/**
 * The people who may work on feedback reports (take them, change status or type, add notes). Every admin can read the reports.
 * Override with FEEDBACK_HANDLER_EMAILS (comma-separated).
 */
const DEFAULTS = ['nico.alex.ha@gmail.com', 'kytama@attentiveid.com', 'ibrohimaji31@gmail.com'];

export const feedbackHandlers = (raw: string | undefined = process.env.FEEDBACK_HANDLER_EMAILS): string[] =>
    (raw ? raw.split(',') : DEFAULTS).map((email) => email.trim().toLowerCase()).filter(Boolean);

export const canHandleFeedback = (user: { role?: string; email?: string | null } | null | undefined): boolean =>
    (user?.role === 'admin' || user?.role === 'superadmin') && feedbackHandlers().includes((user.email ?? '').trim().toLowerCase());
