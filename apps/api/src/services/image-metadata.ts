export interface ImageDimensions {
  width: number;
  height: number;
  mimeType: 'image/webp' | 'image/png' | 'image/jpeg';
}

/**
 * Extracts width, height, and verified mimeType from image buffer headers
 * without external dependencies.
 */
export function extractImageDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 16) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width > 0 && height > 0) {
      return { width, height, mimeType: 'image/png' };
    }
    return null;
  }

  // WebP: RIFF .... WEBP
  if (buffer.length >= 30 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    const chunkType = buffer.subarray(12, 16).toString('ascii');
    if (chunkType === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return width > 0 && height > 0 ? { width, height, mimeType: 'image/webp' } : null;
    } else if (chunkType === 'VP8L') {
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + ((((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)));
      return width > 0 && height > 0 ? { width, height, mimeType: 'image/webp' } : null;
    } else if (chunkType === 'VP8X') {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return width > 0 && height > 0 ? { width, height, mimeType: 'image/webp' } : null;
    }
  }

  // JPEG: FF D8
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 1 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      // Skip 0xFF fill bytes allowed before any JPEG marker
      while (offset < buffer.length && buffer[offset] === 0xff) {
        offset += 1;
      }
      if (offset >= buffer.length) break;
      const marker = buffer[offset];
      offset += 1;

      if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        continue;
      }

      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof) {
        if (offset + 7 > buffer.length) break;
        const height = buffer.readUInt16BE(offset + 3);
        const width = buffer.readUInt16BE(offset + 5);
        return width > 0 && height > 0 ? { width, height, mimeType: 'image/jpeg' } : null;
      }

      if (offset + 2 > buffer.length) break;
      const length = buffer.readUInt16BE(offset);
      if (length < 2) break;
      offset += length;
    }
  }

  return null;
}
