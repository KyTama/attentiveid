import { describe, expect, it } from 'bun:test';
import { EMAIL_COPY } from './email-copy';
import { buildPersonalMail, cleanEmailHtml, hasNameInAddress, htmlToText, readTrackToken, trackToken, trackedLinks } from './email-content';

const SECRET = 'bulk_test_secret_that_is_long_enough_123456';
const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

describe('cleaning the HTML', () => {
    it('keeps the layout an e-mail needs', () => {
        const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>.a{color:#123}</style></head><body><table width="600" cellpadding="0"><tr><td style="padding:8px"><a href="https://attentiveid.com/x?a=1&amp;b=2">Buka</a><img src="https://attentiveid.com/i.png" alt="x > y" width="10"></td></tr></table></body></html>';
        expect(cleanEmailHtml(html)).toBe(html.replace('alt="x > y"', 'alt="x &gt; y"'));
    });

    it('removes scripts, frames, forms, handlers and dangerous addresses', () => {
        const cases = [
            '<script>alert(1)</script>', '<SCRIPT src=x></SCRIPT>', '<script>never closed', '<iframe src="https://x.test"></iframe>',
            '<svg><script>x</script></svg>', '<img src="https://a.test/x.png" onerror="alert(1)">', '<div ONCLICK=alert(1)>t</div>',
            '<a href="javascript:alert(1)">x</a>', '<a href="java&#115;cript:alert(1)">x</a>', '<a href=" jAvAsCrIpT&colon;alert(1)">x</a>',
            '<a href="data:text/html,x">x</a>', '<img src="data:image/png;base64,AAAA">', '<img src="http://a.test/x.png">',
            '<form action="https://x.test"><input name="password"></form>', '<meta http-equiv="refresh" content="0;url=https://x.test">',
            '<link rel="stylesheet" href="https://x.test/a.css">', '<base href="https://x.test">', '<div style="width:expression(alert(1))">t</div>',
            '<<script>script>alert(1)</script>', '<img src="https://a.test/x.png" / onload=alert(1)>', '<!--<script>alert(1)</script>-->',
            '<style></style><img src=x onerror=alert(1)>', '<style>a{}<script>alert(1)</script></style>'
        ];
        for (const bad of cases) {
            const clean = cleanEmailHtml(bad);
            expect(clean).not.toMatch(/<(script|iframe|svg|form|input|link|base)\b|\son\w+\s*=|javascript:|data:|expression\(|http-equiv/i);
        }
    });

    it('a name may fill a path or query, never the start or the site of an address', () => {
        for (const bad of ['<a href="{{name}}">x</a>', '<a href="https://{{name}}/a">x</a>', '<a href="https://x.{{ name }}">x</a>', '<img src="{{name}}">', '<a href="mailto:{{name}}">x</a>', "<a href='&#123;&#123;name}}'>x</a>"]) {
            expect(hasNameInAddress(bad)).toBe(true);
            expect(cleanEmailHtml(bad)).not.toMatch(/(href|src)=/);
        }
        for (const good of ['<a href="https://x.test/hai/{{name}}">x</a>', '<a href="https://x.test?n={{name}}">x</a>', '<p>{{name}}</p>']) expect(hasNameInAddress(good)).toBe(false);
    });

    it('text that only looks like a tag stays text', () => {
        expect(cleanEmailHtml('<p>1 < 2 and 3 > 2</p>')).toBe('<p>1 &lt; 2 and 3 > 2</p>');
    });
});

describe('signed links', () => {
    it('only the right kind, id and signature are accepted', () => {
        const token = trackToken(SECRET, 'click', ID);
        expect(readTrackToken(SECRET, 'click', token)).toBe(ID);
        expect(readTrackToken(SECRET, 'unsubscribe', token)).toBeNull();
        expect(readTrackToken('another_secret', 'click', token)).toBeNull();
        expect(readTrackToken(SECRET, 'click', `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`)).toBeNull();
        expect(readTrackToken(SECRET, 'click', 'x.y')).toBeNull();
    });
});

describe('one person\'s e-mail', () => {
    const html = cleanEmailHtml('<body><p>Halo {{name}},</p><p><a href="https://attentiveid.com/a?x=1&amp;y=2">Baca</a> <a href="mailto:contact@attentiveid.com">Balas</a> <a href="https://x.test/{{name}}">Pribadi</a></p></body>');
    const build = (name: string, track = true) => buildPersonalMail({
        title: 'Hai {{ name }}', html, lang: 'id', name, recipientId: ID, links: trackedLinks(html), secret: SECRET, siteOrigin: 'https://attentiveid.com/', track
    });

    it('tracks only fixed web addresses', () => {
        expect(trackedLinks(html)).toEqual(['https://attentiveid.com/a?x=1&y=2']);
        const mail = build('Ani');
        expect(mail.html).toContain(`href="https://attentiveid.com/api/public/e/c/${trackToken(SECRET, 'click', ID)}/0"`);
        expect(mail.html).toContain('href="mailto:contact@attentiveid.com"');
        expect(mail.html).toContain('/api/public/e/o/');
        expect(mail.html.indexOf('/api/public/e/o/')).toBeLessThan(mail.html.indexOf('</body>'));
        // The plain-text part keeps the real address.
        expect(mail.text).toContain('Baca (https://attentiveid.com/a?x=1&y=2)');
    });

    it('fills the name safely and uses a fallback when there is none', () => {
        const evil = build('<img src=x onerror=1>\r\nBcc: x@y.test');
        expect(evil.html).not.toContain('<img src=x');
        expect(evil.subject).not.toMatch(/[\r\n]/);
        expect(build('').subject).toBe('Hai Kak');
        expect(build('A$&B').html).toContain('Halo A$&amp;B,');
    });

    it('always carries the unsubscribe link and headers; a test has no tracking', () => {
        const unsubscribe = `https://attentiveid.com/api/public/e/u/${trackToken(SECRET, 'unsubscribe', ID)}`;
        for (const mail of [build('Ani'), build('Ani', false)]) {
            expect(mail.html).toContain(unsubscribe);
            expect(mail.text).toContain(unsubscribe);
            expect(mail.headers).toEqual({ 'List-Unsubscribe': `<${unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' });
        }
        const test = build('Ani', false);
        expect(test.html).not.toContain('/api/public/e/c/');
        expect(test.html).not.toContain('/api/public/e/o/');
        expect(test.text).not.toContain('Kami mencatat');
        // There is no privacy page on the site yet, so nothing may link to one.
        expect(`${build('Ani').html}${build('Ani').text}`).not.toContain('/privacy');
        expect(build('Ani').text).toContain('Kami mencatat');
    });

    it('speaks to the recipient as "kamu" in Indonesian', () => {
        const words = Object.values(EMAIL_COPY.id).join(' ');
        expect(words).toContain('kepadamu');
        expect(words).not.toMatch(/Anda/);
    });

    it('turns HTML into readable text', () => {
        expect(htmlToText('<style>x{}</style><h1>Judul</h1><p>Satu &amp; dua<br>tiga</p>')).toBe('Judul\nSatu & dua\ntiga');
    });
});
