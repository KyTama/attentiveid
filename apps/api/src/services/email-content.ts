/**
 * Turning what an admin wrote into the e-mail one person receives: cleaning the HTML, filling {{name}}, adding the footer,
 * the unsubscribe link and the open/click tracking, and the signed tokens those links carry.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { EmailLanguage } from '@attentiveid/shared';
import { EMAIL_COPY, NAME_FALLBACK } from './email-copy';

export const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', colon: ':', tab: '\t', newline: '\n' };
export const decodeEntities = (value: string) =>
    value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (match, code: string) => {
        if (code[0] !== '#') return NAMED[code.toLowerCase()] ?? match;
        const point = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return point <= 0x10ffff ? String.fromCodePoint(point) : match;
    });

/* ---------------------------------------------------------------- cleaning */

const ALLOWED = new Set(('html head body title style meta div span p br hr a img table thead tbody tfoot tr td th caption col colgroup '
    + 'h1 h2 h3 h4 h5 h6 ul ol li b strong i em u s small big sup sub blockquote pre code center font figure figcaption '
    + 'header footer section article main address').split(' '));
/** Removed together with everything inside them. */
const DROPPED = ['script', 'iframe', 'object', 'embed', 'applet', 'noscript', 'template', 'svg', 'math', 'frameset', 'noframes'];

// A comment, a tag (quoted values may hold ">"), or a run of text. The alternatives start differently, so no backtracking blow-up.
const TOKEN = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:"[^"]*"|'[^']*'|[^"'<>])*>|<|[^<]+/g;
const ATTRIBUTE = /([^\s"'=<>/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

// eslint-disable-next-line no-control-regex
const compact = (value: string) => decodeEntities(value).replace(/[\u0000- \u007f- ]/g, '').toLowerCase();
const safeHref = (value: string) => /^(https?:\/\/|mailto:|tel:|#)/.test(compact(value));
/** {{name}} in the scheme or host part (or at the very start) would let a contact's name choose the destination. */
const nameDecidesAddress = (value: string) => /^(?:[a-z][a-z0-9+.-]*:(?:\/\/)?)?[^/?#]*\{\{/.test(compact(value));
export const hasNameInAddress = (html: string) =>
    [...html.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))/gi)].some((m) => nameDecidesAddress(m[1] ?? m[2] ?? m[3] ?? ''));
const safeSrc = (value: string) => compact(value).startsWith('https://');
const safeCss = (value: string) => !/(javascript:|expression\(|-moz-binding|behavior:)/.test(compact(value).replace(/\/\*.*?\*\//g, ''));

const cleanTag = (token: string): string => {
    const match = token.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([\s\S]*?)\/?>$/);
    if (!match) return '';
    const [, closing, rawName, rest] = match;
    const name = rawName!.toLowerCase();
    if (!ALLOWED.has(name)) return '';
    if (closing) return `</${name}>`;
    const kept: string[] = [];
    for (const found of rest!.matchAll(ATTRIBUTE)) {
        const key = found[1]!.toLowerCase();
        const value = found[2] ?? found[3] ?? found[4] ?? '';
        if (!/^[a-z][a-z0-9:_-]*$/.test(key) || key.startsWith('on') || ['srcdoc', 'srcset', 'formaction', 'action', 'background', 'xlink:href'].includes(key)) continue;
        if (key === 'href' && (name !== 'a' || !safeHref(value) || nameDecidesAddress(value))) continue;
        if (key === 'src' && (name !== 'img' || !safeSrc(value) || nameDecidesAddress(value))) continue;
        if (key === 'style' && !safeCss(value)) continue;
        kept.push(` ${key}="${value.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"`);
    }
    // <meta> is only for the character set and the phone layout (never refresh).
    if (name === 'meta' && !kept.some((a) => a.startsWith(' charset=') || a.toLowerCase() === ' name="viewport"')) return '';
    return `<${name}${kept.join('')}>`;
};

/** Keeps the tags e-mail needs and rebuilds each one, so scripts, forms, frames and event handlers cannot come through. */
export const cleanEmailHtml = (html: string): string => {
    let out = '';
    let skipping = '';
    let inStyle = false;
    for (const [token] of html.matchAll(TOKEN)) {
        const tag = token.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)/);
        const name = tag?.[2]!.toLowerCase();
        if (skipping) {
            if (tag?.[1] && name === skipping) skipping = '';
            continue;
        }
        if (inStyle) {
            if (tag?.[1] && name === 'style') {
                out += '</style>';
                inStyle = false;
            } else if (safeCss(token) && !/<[/!a-z]/i.test(token)) out += token;
            continue;
        }
        if (token.startsWith('<!')) {
            if (/^<!doctype html/i.test(token)) out += '<!DOCTYPE html>';
            continue;
        }
        if (!tag) {
            out += token === '<' ? '&lt;' : token;
            continue;
        }
        if (DROPPED.includes(name!)) {
            if (!tag[1] && !token.endsWith('/>')) skipping = name!;
            continue;
        }
        out += cleanTag(token);
        if (name === 'style' && !tag[1]) inStyle = true;
    }
    if (inStyle) out += '</style>';
    return out;
};

/* ---------------------------------------------------------------- tokens */

export type TrackKind = 'open' | 'click' | 'unsubscribe';

const signature = (secret: string, kind: TrackKind, id: string) =>
    createHmac('sha256', secret).update(`email-bulk:${kind}:${id}`).digest('base64url').slice(0, 32);

/** Holds the recipient row id and a signature: no name or address in any link. */
export const trackToken = (secret: string, kind: TrackKind, recipientId: string) =>
    `${recipientId.replace(/-/g, '')}.${signature(secret, kind, recipientId)}`;

export const readTrackToken = (secret: string, kind: TrackKind, token: string): string | null => {
    const match = token.match(/^([0-9a-f]{32})\.([A-Za-z0-9_-]{32})$/);
    if (!match) return null;
    const id = match[1]!.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
    const expected = Buffer.from(signature(secret, kind, id));
    const given = Buffer.from(match[2]!);
    return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
};

/* ---------------------------------------------------------------- one person's e-mail */

/** The web addresses in the body that clicks are counted for, in order, each once. */
export const trackedLinks = (cleanHtml: string): string[] => {
    const links = new Set<string>();
    for (const match of cleanHtml.matchAll(/<a\b[^<>]*?\shref="([^"]*)"/g)) {
        const url = decodeEntities(match[1]!).trim();
        // A personalised address would be different for everyone, so it stays as written.
        if (/^https?:\/\//i.test(url) && !url.includes('{{')) links.add(url);
        if (links.size >= 100) break;
    }
    return [...links];
};

const fillName = (text: string, value: string) => text.replace(/\{\{\s*name\s*\}\}/gi, () => value);

export const htmlToText = (html: string): string =>
    decodeEntities(
        html
            .replace(/<(head|style|title)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<a\b[^<>]*?\shref="([^"]*)"[^<>]*>([\s\S]*?)<\/a>/gi, (_all, href: string, label: string) => {
                const words = label.replace(/<[^>]*>/g, '').trim();
                return !words || words === href ? href : `${words} (${href})`;
            })
            .replace(/<(br|\/p|\/div|\/tr|\/h[1-6]|\/li|\/table)\b[^>]*>/gi, '\n')
            .replace(/<[^>]*>/g, '')
    ).replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

export interface PersonalInput {
    title: string;
    /** Already cleaned. */
    html: string;
    lang: EmailLanguage;
    name: string;
    recipientId: string;
    /** The campaign's tracked addresses, in the order stored. */
    links: string[];
    secret: string;
    siteOrigin: string;
    /** False for the test e-mail to oneself. */
    track: boolean;
}

export interface PersonalMail {
    subject: string;
    html: string;
    text: string;
    headers: Record<string, string>;
}

export const buildPersonalMail = (input: PersonalInput): PersonalMail => {
    const copy = EMAIL_COPY[input.lang];
    const name = input.name.trim() || NAME_FALLBACK[input.lang];
    const base = `${input.siteOrigin.replace(/\/$/, '')}/api/public/e`;
    const unsubscribe = `${base}/u/${trackToken(input.secret, 'unsubscribe', input.recipientId)}`;

    const filled = fillName(input.html, escapeHtml(name));
    const text = `${htmlToText(filled)}\n\n--\n${copy.reason}\n${input.track ? `${copy.tracking}\n` : ''}${copy.unsubscribe}: ${unsubscribe}`;

    let html = filled;
    if (input.track) {
        const click = trackToken(input.secret, 'click', input.recipientId);
        html = html.replace(/(<a\b[^<>]*?\shref=")([^"]*)(")/g, (all, before: string, href: string, after: string) => {
            const position = input.links.indexOf(decodeEntities(href).trim());
            return position < 0 ? all : `${before}${base}/c/${click}/${position}${after}`;
        });
    }
    const pixel = input.track
        ? `<img src="${base}/o/${trackToken(input.secret, 'open', input.recipientId)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`
        : '';
    const footer = `<div style="margin-top:32px;padding:16px;border-top:1px solid #e2e8f0;font:12px/1.6 Arial,sans-serif;color:#64748b;text-align:center">`
        + `${escapeHtml(copy.reason)}<br>${input.track ? `${escapeHtml(copy.tracking)}<br>` : ''}`
        + `<a href="${unsubscribe}" style="color:#475569">${escapeHtml(copy.unsubscribe)}</a></div>${pixel}`;
    const end = html.toLowerCase().lastIndexOf('</body>');
    html = end >= 0 ? `${html.slice(0, end)}${footer}${html.slice(end)}` : `${html}${footer}`;

    return {
        // One line only: a name must never add a header.
        // eslint-disable-next-line no-control-regex
        subject: fillName(input.title, name).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim(),
        html,
        text,
        headers: { 'List-Unsubscribe': `<${unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
    };
};
