import fs from 'node:fs';
import path from 'node:path';

export interface SaveMediaOptions {
  subDir: 'psychologists' | 'landing' | string;
  filename: string;
  buffer: Buffer;
}

export interface SaveMediaResult {
  filePath: string;
  publicUrl: string;
}

/**
 * Resolves the primary directory where uploaded media files should be stored.
 * Priority:
 * 1. Process environment variable `MEDIA_DIR`
 * 2. Monorepo local development `apps/web/public/media` (or `../web/public/media`)
 * 3. Default fallback `./uploads/media` relative to process cwd
 */
export function getMediaStorageDir(): string {
  if (process.env.MEDIA_DIR && process.env.MEDIA_DIR.trim().length > 0) {
    return path.resolve(process.env.MEDIA_DIR.trim());
  }

  // Check if we are running in the monorepo root
  const rootWebMedia = path.resolve(process.cwd(), 'apps/web/public/media');
  if (fs.existsSync(rootWebMedia)) {
    return rootWebMedia;
  }

  // Check if we are running inside apps/api
  const siblingWebMedia = path.resolve(process.cwd(), '../web/public/media');
  if (fs.existsSync(siblingWebMedia)) {
    return siblingWebMedia;
  }

  return path.resolve(process.cwd(), 'uploads/media');
}

/**
 * Saves an uploaded media file safely with recursive directory creation
 * and graceful fallback handling in read-only container filesystems.
 */
export async function saveMediaFile(options: SaveMediaOptions): Promise<SaveMediaResult> {
  const { subDir, filename, buffer } = options;
  const primaryBase = getMediaStorageDir();
  let targetDir = path.join(primaryBase, subDir);

  try {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, filename), buffer);
  } catch (err: any) {
    // If the primary path fails with EROFS (Read-Only File System) or EACCES,
    // fallback to writable tmpfs (/tmp/uploads/media) so the request doesn't crash
    if (err?.code === 'EROFS' || err?.code === 'EACCES') {
      const fallbackBase = path.resolve('/tmp/uploads/media');
      targetDir = path.join(fallbackBase, subDir);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, filename), buffer);
    } else {
      throw err;
    }
  }

  // Sync to local web/dist if available (useful during local preview / build tests)
  try {
    const webDist = fs.existsSync(path.resolve(process.cwd(), 'apps/web/dist'))
      ? path.resolve(process.cwd(), 'apps/web/dist')
      : (fs.existsSync(path.resolve(process.cwd(), '../web/dist'))
        ? path.resolve(process.cwd(), '../web/dist')
        : null);

    if (webDist) {
      const distMediaDir = path.join(webDist, 'media', subDir);
      fs.mkdirSync(distMediaDir, { recursive: true });
      fs.writeFileSync(path.join(distMediaDir, filename), buffer);
    }
  } catch {
    // Dist sync is purely best-effort, safe to ignore failures
  }

  const filePath = path.join(targetDir, filename);
  const publicUrl = `/media/${subDir}/${filename}`;

  return {
    filePath,
    publicUrl
  };
}

/**
 * Checks if a requested media file exists in the storage directory or fallback directory.
 */
export function getMediaFilePath(relativePath: string): string | null {
  // Prevent directory traversal attacks
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (normalized.includes('..')) {
    return null;
  }

  const primaryPath = path.join(getMediaStorageDir(), normalized);
  if (fs.existsSync(primaryPath)) {
    return primaryPath;
  }

  const fallbackPath = path.join('/tmp/uploads/media', normalized);
  if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }

  return null;
}
