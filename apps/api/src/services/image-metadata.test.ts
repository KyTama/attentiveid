import { describe, expect, it } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { extractImageDimensions } from './image-metadata';

describe('extractImageDimensions', () => {
  it('correctly reads existing psychologist webp images', () => {
    const haykalPath = path.resolve(process.cwd(), 'apps/web/public/media/psychologists/haykal.webp');
    if (fs.existsSync(haykalPath)) {
      const buffer = fs.readFileSync(haykalPath);
      const dimensions = extractImageDimensions(buffer);
      expect(dimensions).not.toBeNull();
      expect(dimensions?.mimeType).toBe('image/webp');
      expect(dimensions?.width).toBe(600);
      expect(dimensions?.height).toBe(750);
    }
  });

  it('returns null on invalid or short buffer', () => {
    expect(extractImageDimensions(Buffer.from('not an image'))).toBeNull();
  });

  it('parses JPEG with 0xFF padding bytes and standalone markers', () => {
    // SOI (FF D8) + APP0 (FF E0, len 4) + 0xFF padding + SOF0 (FF C0, 600x800)
    const jpeg = Buffer.from([
      0xff, 0xd8,
      0xff, 0xe0, 0x00, 0x04, 0x00, 0x00,
      0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x03, 0x20, 0x02, 0x58, 0x03, 0x01, 0x22, 0x00,
    ]);
    expect(extractImageDimensions(jpeg)).toEqual({
      width: 600,
      height: 800,
      mimeType: 'image/jpeg',
    });
  });
});
