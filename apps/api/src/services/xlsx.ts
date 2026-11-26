/**
 * Just enough of .xlsx (a zip of XML files) for the contact list: write sheets of text cells, and read back the cells of a
 * file a person edited in Excel, LibreOffice or Google Sheets. Written here so an uploaded file is handled under our own
 * limits (size after unpacking, number of rows and columns) and no spreadsheet library is needed.
 *
 * Values are always written as text, so a value starting with "=" is never run as a formula and phone numbers keep their 0.
 */
import { deflateRawSync, inflateRawSync } from 'node:zlib';

export interface SheetData {
    name: string;
    rows: string[][];
    /** Column widths in characters. */
    widths?: number[];
    /** Zero-based columns that are hidden. */
    hidden?: number[];
}

export class XlsxError extends Error {
    readonly reason: 'not_xlsx' | 'too_big' | 'too_many_rows';
    constructor(reason: XlsxError['reason']) {
        super(reason);
        this.reason = reason;
    }
}

/** No cell of the contact list is longer; the rest is cut off, so later checks still see "too long". */
export const MAX_CELL_CHARS = 2_001;
/** Far above any real contact list; they stop a file that is mostly empty rows or cells from taking seconds of work. */
const MAX_ROW_ELEMENTS = 50_000;
const MAX_CELL_ELEMENTS = 400_000;
const MAX_SHARED_STRINGS = 200_000;

/* ---------------------------------------------------------------- zip */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
const crc32 = (data: Buffer) => {
    let c = 0xffffffff;
    for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

export const zip = (files: Array<[string, string]>): Buffer => {
    const body: Buffer[] = [];
    const directory: Buffer[] = [];
    let offset = 0;
    for (const [name, text] of files) {
        const raw = Buffer.from(text, 'utf8');
        const packed = deflateRawSync(raw);
        const label = Buffer.from(name, 'utf8');
        const crc = crc32(raw);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);
        local.writeUInt16LE(20, 4);
        local.writeUInt16LE(8, 8);
        local.writeUInt32LE(0x00210000, 10); // 1 January 1980: the same input gives the same file
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(packed.length, 18);
        local.writeUInt32LE(raw.length, 22);
        local.writeUInt16LE(label.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0);
        central.writeUInt16LE(20, 4);
        central.writeUInt16LE(20, 6);
        central.writeUInt16LE(8, 10);
        central.writeUInt32LE(0x00210000, 12);
        central.writeUInt32LE(crc, 16);
        central.writeUInt32LE(packed.length, 20);
        central.writeUInt32LE(raw.length, 24);
        central.writeUInt16LE(label.length, 28);
        central.writeUInt32LE(offset, 42);
        body.push(local, label, packed);
        directory.push(central, label);
        offset += local.length + label.length + packed.length;
    }
    const size = directory.reduce((sum, part) => sum + part.length, 0);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(size, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...body, ...directory, end]);
};

/** The entries we ask for, unpacked, with a hard ceiling on the total so a "zip bomb" stops early. */
const unzip = (data: Buffer, wanted: (name: string) => boolean, maxBytes: number): Map<string, string> => {
    const bad = () => new XlsxError('not_xlsx');
    let end = -1;
    for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i -= 1) {
        if (data.readUInt32LE(i) === 0x06054b50) { end = i; break; }
    }
    if (end < 0) throw bad();
    const count = data.readUInt16LE(end + 10);
    let at = data.readUInt32LE(end + 16);
    if (count > 2000) throw bad();
    const found = new Map<string, string>();
    let total = 0;
    for (let n = 0; n < count; n += 1) {
        if (at + 46 > data.length || data.readUInt32LE(at) !== 0x02014b50) throw bad();
        const method = data.readUInt16LE(at + 10);
        const packedSize = data.readUInt32LE(at + 20);
        const nameLength = data.readUInt16LE(at + 28);
        const skip = data.readUInt16LE(at + 30) + data.readUInt16LE(at + 32);
        const local = data.readUInt32LE(at + 42);
        const name = data.toString('utf8', at + 46, at + 46 + nameLength);
        at += 46 + nameLength + skip;
        if (!wanted(name)) continue;
        if (local + 30 > data.length || data.readUInt32LE(local) !== 0x04034b50) throw bad();
        const start = local + 30 + data.readUInt16LE(local + 26) + data.readUInt16LE(local + 28);
        const packed = data.subarray(start, start + packedSize);
        let raw: Buffer;
        try {
            if (method === 0) raw = packed;
            else if (method === 8) raw = inflateRawSync(packed, { maxOutputLength: Math.max(1, maxBytes - total) });
            else throw bad();
        } catch (error) {
            if ((error as { code?: string }).code === 'ERR_BUFFER_TOO_LARGE' || error instanceof RangeError) throw new XlsxError('too_big');
            throw bad();
        }
        total += raw.length;
        if (total > maxBytes) throw new XlsxError('too_big');
        found.set(name, raw.toString('utf8'));
    }
    return found;
};

/* ---------------------------------------------------------------- xml */

const escapeXml = (value: string) =>
    value
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unescapeXml = (value: string) =>
    value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, code: string) => {
        if (code[0] !== '#') return NAMED[code.toLowerCase()] ?? match;
        const point = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return point <= 0x10ffff ? String.fromCodePoint(point) : match;
    });

/**
 * Every `<tag …>inner</tag>` or `<tag …/>`, with an optional namespace prefix. Cells and rows never nest in themselves.
 * A scan that only moves forward: a crafted file with many unclosed tags is refused at the first one instead of being
 * searched to the end again and again.
 */
function* elements(xml: string, tag: string): Generator<{ attributes: string; inner: string; start: number; end: number }> {
    const open = new RegExp(`<((?:\\w+:)?)${tag}(?=[\\s/>])([^<>]*)>`, 'g');
    for (let match = open.exec(xml); match; match = open.exec(xml)) {
        const attributes = match[2]!;
        if (attributes.endsWith('/')) {
            yield { attributes: attributes.slice(0, -1), inner: '', start: match.index, end: open.lastIndex };
            continue;
        }
        const close = `</${match[1]}${tag}>`;
        const at = xml.indexOf(close, open.lastIndex);
        if (at < 0) throw new XlsxError('not_xlsx');
        const inner = xml.slice(open.lastIndex, at);
        open.lastIndex = at + close.length;
        yield { attributes, inner, start: match.index, end: open.lastIndex };
    }
}

/** The xml without these elements. */
const without = (xml: string, tag: string) => {
    let kept = '';
    let from = 0;
    for (const found of elements(xml, tag)) {
        kept += xml.slice(from, found.start);
        from = found.end;
    }
    return kept + xml.slice(from);
};

const attribute = (attributes: string | undefined, name: string) => {
    const match = attributes?.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
    return match ? unescapeXml(match[1]!) : undefined;
};

/** The text of a (rich) string: all its <t> runs, without the phonetic hints. */
const textOf = (xml: string) => [...elements(without(xml, 'rPh'), 't')].map((found) => unescapeXml(found.inner)).join('');

const columnIndex = (reference: string) => {
    let index = 0;
    for (const letter of reference.match(/^[A-Z]+/)?.[0] ?? '') index = index * 26 + (letter.charCodeAt(0) - 64);
    return index - 1;
};
const columnName = (index: number): string =>
    (index >= 26 ? columnName(Math.floor(index / 26) - 1) : '') + String.fromCharCode(65 + (index % 26));

/* ---------------------------------------------------------------- write */

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

// Style 0 = text (what a person types in these columns stays text), style 1 = bold text for the header row.
const STYLES = `${XML}<styleSheet xmlns="${MAIN}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf numFmtId="49" fontId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="49" fontId="1" xfId="0" applyNumberFormat="1" applyFont="1"/></cellXfs></styleSheet>`;

const sheetXml = (sheet: SheetData) => {
    const columns = Math.max(1, ...sheet.rows.map((row) => row.length));
    const cols = Array.from({ length: columns }, (_, i) =>
        `<col min="${i + 1}" max="${i + 1}" width="${sheet.widths?.[i] ?? 18}" style="0" customWidth="1"${sheet.hidden?.includes(i) ? ' hidden="1"' : ''}/>`).join('');
    const rows = sheet.rows.map((row, r) => {
        const cells = row.map((value, c) => value === ''
            ? ''
            : `<c r="${columnName(c)}${r + 1}" s="${r === 0 ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`).join('');
        return `<row r="${r + 1}">${cells}</row>`;
    }).join('');
    return `${XML}<worksheet xmlns="${MAIN}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${rows}</sheetData></worksheet>`;
};

export const writeXlsx = (sheets: SheetData[]): Buffer => {
    const types = sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
    return zip([
        ['[Content_Types].xml', `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${types}</Types>`],
        ['_rels/.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
        ['xl/workbook.xml', `${XML}<workbook xmlns="${MAIN}" xmlns:r="${REL}"><sheets>${sheets.map((s, i) => `<sheet name="${escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
        ['xl/_rels/workbook.xml.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${REL}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="${REL}/styles" Target="styles.xml"/></Relationships>`],
        ['xl/styles.xml', STYLES],
        ...sheets.map((sheet, i): [string, string] => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(sheet)])
    ]);
};

/* ---------------------------------------------------------------- read */

export interface ReadLimits {
    maxUnpackedBytes?: number;
    maxRows?: number;
    maxColumns?: number;
    maxSheets?: number;
}

/** Sheets in workbook order. Row i of a sheet is spreadsheet row i + 1 (empty rows are kept so row numbers stay true). */
export const readXlsx = (data: Buffer, limits: ReadLimits = {}): SheetData[] => {
    const { maxUnpackedBytes = 20 * 1024 * 1024, maxRows = 10_001, maxColumns = 30, maxSheets = 5 } = limits;
    const files = unzip(data, (name) => name === 'xl/workbook.xml' || name === 'xl/_rels/workbook.xml.rels' || name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/[^/]+\.xml$/.test(name), maxUnpackedBytes);
    const workbook = files.get('xl/workbook.xml');
    const relations = files.get('xl/_rels/workbook.xml.rels');
    if (!workbook || !relations) throw new XlsxError('not_xlsx');

    const targets = new Map<string, string>();
    for (const { attributes } of elements(relations, 'Relationship')) {
        const id = attribute(attributes, 'Id');
        const target = attribute(attributes, 'Target');
        if (id && target) targets.set(id, target.startsWith('/') ? target.slice(1) : `xl/${target}`);
    }
    const shared: string[] = [];
    for (const found of elements(files.get('xl/sharedStrings.xml') ?? '', 'si')) {
        if (shared.length >= MAX_SHARED_STRINGS) throw new XlsxError('too_big');
        shared.push(textOf(found.inner).slice(0, MAX_CELL_CHARS));
    }
    let rowElements = 0;
    let cellElements = 0;

    return [...elements(workbook, 'sheet')].slice(0, maxSheets).map((entry) => {
        const name = attribute(entry.attributes, 'name') ?? '';
        const xml = files.get(targets.get(attribute(entry.attributes, 'r:id') ?? '') ?? '');
        if (xml === undefined) throw new XlsxError('not_xlsx');
        const rows: string[][] = [];
        let rowNumber = 0;
        for (const row of elements(xml, 'row')) {
            if (++rowElements > MAX_ROW_ELEMENTS) throw new XlsxError('too_many_rows');
            rowNumber = Number(attribute(row.attributes, 'r')) || rowNumber + 1;
            const cells: string[] = [];
            let column = -1;
            for (const cell of elements(row.inner, 'c')) {
                if (++cellElements > MAX_CELL_ELEMENTS) throw new XlsxError('too_big');
                const reference = attribute(cell.attributes, 'r');
                column = reference ? columnIndex(reference) : column + 1;
                if (column < 0 || column >= maxColumns) continue;
                const type = attribute(cell.attributes, 't');
                const inner = cell.inner;
                const value = unescapeXml([...elements(inner, 'v')][0]?.inner ?? '').slice(0, MAX_CELL_CHARS);
                let text = value;
                if (type === 's') text = shared[Number(value)] ?? '';
                else if (type === 'inlineStr') text = textOf(inner);
                // A number typed into a cell may be stored as 6.28E+12.
                else if ((!type || type === 'n') && /e\+?\d+$/i.test(value)) text = Number(value).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 0 });
                if (text !== '') cells[column] = text.slice(0, MAX_CELL_CHARS);
            }
            // Excel also stores empty rows that only carry formatting; they do not count against the limit.
            if (cells.length === 0) continue;
            if (rowNumber > maxRows) throw new XlsxError('too_many_rows');
            while (rows.length < rowNumber - 1) rows.push([]);
            rows[rowNumber - 1] = Array.from(cells, (value) => value ?? '');
        }
        return { name, rows };
    });
};
