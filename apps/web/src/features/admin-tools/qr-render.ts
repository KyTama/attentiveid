import QRCode from 'qrcode'
import type { QrCodeInput } from '@attentiveid/shared'

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Logo tidak bisa dibaca.'))
    image.src = src
  })

/**
 * Draws the QR code (error correction H so a centre logo does not break scanning) and the logo on a
 * padded background plate. Returns false when the target URL is empty.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  design: Pick<QrCodeInput, 'targetUrl' | 'foreground' | 'background' | 'logoDataUrl' | 'logoScale'>,
  size = 512,
): Promise<boolean> {
  if (!design.targetUrl.trim()) return false
  await QRCode.toCanvas(canvas, design.targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: size,
    color: { dark: design.foreground, light: design.background },
  })
  // The library fixes the on-screen size in pixels; let CSS scale it to its container instead.
  canvas.style.width = '100%'
  canvas.style.height = 'auto'
  if (!design.logoDataUrl) return true

  const context = canvas.getContext('2d')
  if (!context) return true
  const logo = await loadImage(design.logoDataUrl)
  const logoWidth = canvas.width * design.logoScale
  const ratio = logo.naturalHeight / logo.naturalWidth || 1
  const logoHeight = logoWidth * ratio
  const pad = canvas.width * 0.018
  const plateWidth = logoWidth + pad * 2
  const plateHeight = logoHeight + pad * 2
  const x = (canvas.width - plateWidth) / 2
  const y = (canvas.height - plateHeight) / 2

  context.fillStyle = design.background
  context.beginPath()
  context.roundRect(x, y, plateWidth, plateHeight, pad * 1.5)
  context.fill()
  context.drawImage(logo, x + pad, y + pad, logoWidth, logoHeight)
  return true
}

export const downloadCanvasPng = (canvas: HTMLCanvasElement, fileName: string) => {
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${fileName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'qr-code'}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}
