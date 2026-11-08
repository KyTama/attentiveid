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
});
