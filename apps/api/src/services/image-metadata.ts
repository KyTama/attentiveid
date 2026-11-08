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
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height, mimeType: 'image/png' };
  }

  // WebP: RIFF .... WEBP
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    const chunkType = buffer.subarray(12, 16).toString('ascii');
    if (chunkType === 'VP8 ') {
      // VP8 keyframe
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height, mimeType: 'image/webp' };
    } else if (chunkType === 'VP8L') {
      // VP8L lossless
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + ((((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)));
      return { width, height, mimeType: 'image/webp' };
    } else if (chunkType === 'VP8X') {
      // VP8X extended
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height, mimeType: 'image/webp' };
    }
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) { // SOF0 or SOF2
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height, mimeType: 'image/jpeg' };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return null;
}
