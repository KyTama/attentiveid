import type { CSSProperties } from 'react'

interface GiftBoxProps {
  /** Width in px. */
  size: number
  /** A picture set in the portal; empty = the built-in red box with a yellow ribbon. */
  imageUrl?: string
}

/** The gift: a red 3D box with a yellow ribbon, or a picture chosen in the portal. */
export function GiftBox({ size, imageUrl }: GiftBoxProps) {
  const style = { '--s': `${size}px` } as CSSProperties
  if (imageUrl) {
    return <img alt="" className="gift-image gift-box" draggable={false} src={imageUrl} style={style} />
  }
  return (
    <span aria-hidden="true" className="gift-box" style={style}>
      <span className="gift-cube">
        <span className="gift-face gift-body-front" />
        <span className="gift-face gift-body-back" />
        <span className="gift-face gift-body-left" />
        <span className="gift-face gift-body-right" />
        <span className="gift-face gift-lid-front" />
        <span className="gift-face gift-lid-back" />
        <span className="gift-face gift-lid-left" />
        <span className="gift-face gift-lid-right" />
        <span className="gift-face gift-top" />
        <span className="gift-bow" />
        <span className="gift-knot" />
      </span>
    </span>
  )
}

/** The big version that covers the whole screen. */
export function GiftCoverArt({ imageUrl }: { imageUrl?: string }) {
  if (imageUrl) {
    return <img alt="" className="gift-cover-image" draggable={false} src={imageUrl} />
  }
  return (
    <span aria-hidden="true" className="gift-cover-bow">
      <span className="gift-cover-knot" />
    </span>
  )
}
