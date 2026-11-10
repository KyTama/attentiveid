import { describe, expect, it, afterEach } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { getMediaStorageDir, saveMediaFile, getMediaFilePath } from './media-storage';

describe('Media Storage Service', () => {
  const originalMediaDir = process.env.MEDIA_DIR;

  afterEach(() => {
    process.env.MEDIA_DIR = originalMediaDir;
  });

  it('respects MEDIA_DIR environment variable when set', () => {
    process.env.MEDIA_DIR = '/custom/media/path';
    expect(getMediaStorageDir()).toBe(path.resolve('/custom/media/path'));
  });

  it('saves file and returns filePath and publicUrl', async () => {
    const testDir = path.resolve('/tmp/test-media-storage');
    process.env.MEDIA_DIR = testDir;

    const dummyBuffer = Buffer.from('test image content');
    const result = await saveMediaFile({
      subDir: 'psychologists',
      filename: 'test-dr.webp',
      buffer: dummyBuffer
    });

    expect(result.publicUrl).toBe('/media/psychologists/test-dr.webp');
    expect(fs.existsSync(result.filePath)).toBe(true);
    expect(fs.readFileSync(result.filePath).toString()).toBe('test image content');

    const foundPath = getMediaFilePath('psychologists/test-dr.webp');
    expect(foundPath).toBe(result.filePath);

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('prevents path traversal in getMediaFilePath', () => {
    expect(getMediaFilePath('../../etc/passwd')).toBeNull();
    expect(getMediaFilePath('../../../secret.env')).toBeNull();
  });

  it('serves static media via createApp endpoint', async () => {
    const { createApp } = await import('../app');
    const testDir = path.resolve('/tmp/test-media-serving');
    process.env.MEDIA_DIR = testDir;

    await saveMediaFile({
      subDir: 'psychologists',
      filename: 'sample.webp',
      buffer: Buffer.from('binary-image-data')
    });

    const app = createApp({
      frontendOrigin: 'http://localhost:5173',
      landingContentService: { getPublishedContent: async () => null, getHeroSection: async () => null },
      psychologistsService: { getFeaturedPsychologists: async () => [] }
    });

    const res = await app.handle(new Request('http://localhost/media/psychologists/sample.webp'));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('binary-image-data');

    const notFoundRes = await app.handle(new Request('http://localhost/media/psychologists/non-existent.webp'));
    expect(notFoundRes.status).toBe(404);

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
  });
});
