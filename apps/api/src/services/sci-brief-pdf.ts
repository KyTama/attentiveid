import { PDFDocument } from 'pdf-lib'

export class SciBriefPdfError extends Error {}

export interface SplitPdfResult {
  totalPages: number
  /** How many pages ended up in the preview (never more than the document has). */
  previewPages: number
  /** A new PDF holding only the first pages, so the rest never leaves the server. */
  previewBytes: Buffer
}

const PDF_HEADER = '%PDF-'

/**
 * Builds the public preview of a Sci-Brief. The preview is a brand-new PDF made
 * from the first pages only, so nothing from the locked pages (text, images or
 * metadata) is present in the file visitors download.
 */
export async function splitSciBriefPdf(input: Uint8Array, previewPages: number): Promise<SplitPdfResult> {
  const head = Buffer.from(input.subarray(0, 1024)).toString('latin1')
  if (!head.includes(PDF_HEADER)) {
    throw new SciBriefPdfError('File bukan dokumen PDF yang valid.')
  }

  let source: PDFDocument
  try {
    source = await PDFDocument.load(input)
  } catch {
    throw new SciBriefPdfError('PDF tidak dapat dibaca. Pastikan file tidak dilindungi kata sandi atau rusak.')
  }

  const totalPages = source.getPageCount()
  if (totalPages < 1) {
    throw new SciBriefPdfError('PDF tidak memiliki halaman.')
  }

  const count = Math.max(1, Math.min(previewPages, totalPages))
  const preview = await PDFDocument.create()
  const pages = await preview.copyPages(source, Array.from({ length: count }, (_, index) => index))
  for (const page of pages) preview.addPage(page)
  preview.setTitle('Sci-Brief preview')
  preview.setAuthor('Attentive.id')

  return {
    totalPages,
    previewPages: count,
    previewBytes: Buffer.from(await preview.save()),
  }
}
