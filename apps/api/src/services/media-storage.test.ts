import { describe, expect, it, afterEach } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildVersionedMediaFilename,
  deleteVersionedMediaFile,
  getMediaFilePath,
  getMediaStorageDir,
  isVersionedMediaObjectKey,
  saveMediaFile,
} from './media-storage';

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

  it('reclaims replaced versioned uploads while never deleting seeded baseline files', async () => {
    const testDir = path.resolve('/tmp/test-media-cleanup');
    process.env.MEDIA_DIR = testDir;

    const versionedFilename = buildVersionedMediaFilename('_Dr. Test_', 'jpg');
    expect(versionedFilename).toMatch(/^dr-test-[a-z0-9]+-[a-f0-9]{6}\.jpg$/);

    const versionedKey = `media/psychologists/${versionedFilename}`;
    expect(isVersionedMediaObjectKey(versionedKey)).toBe(true);
    expect(isVersionedMediaObjectKey('media/psychologists/haykal.webp')).toBe(false);
    expect(isVersionedMediaObjectKey('media/psychologists/default.webp')).toBe(false);

    await saveMediaFile({
      subDir: 'psychologists',
      filename: versionedFilename,
      buffer: Buffer.from('old-versioned-photo'),
    });
    await saveMediaFile({
      subDir: 'psychologists',
      filename: 'baseline-sample.webp',
      buffer: Buffer.from('seeded-baseline-photo'),
    });

    expect(deleteVersionedMediaFile(versionedKey)).toBe(true);
    expect(getMediaFilePath(`psychologists/${versionedFilename}`)).toBeNull();

    expect(deleteVersionedMediaFile('media/psychologists/baseline-sample.webp')).toBe(false);
    expect(getMediaFilePath('psychologists/baseline-sample.webp')).not.toBeNull();

    fs.rmSync(testDir, { recursive: true, force: true });
    for (const rootCandidate of [process.cwd(), path.resolve(import.meta.dir, '../../../..')]) {
      const distBaseline = path.resolve(rootCandidate, 'apps/web/dist/media/psychologists/baseline-sample.webp');
      if (fs.existsSync(distBaseline)) fs.unlinkSync(distBaseline);
    }
  });
});
