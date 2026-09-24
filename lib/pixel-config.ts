/**
 * Meta Pixel ID — must be available where you inject the snippet.
 *
 * Prefer Admin → Paramètres → ID Pixel, or set any of:
 * NEXT_PUBLIC_FACEBOOK_PIXEL_ID / NEXT_PUBLIC_FB_PIXEL_ID / FACEBOOK_PIXEL_ID
 */
export function getPixelIdForServer(): string {
  return (
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ||
    process.env.FACEBOOK_PIXEL_ID?.trim() ||
    ''
  ).replace(/\D/g, '')
}

/** Client bundle — only NEXT_PUBLIC_* is visible here. */
export function getPixelIdForClient(): string {
  return (
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ||
    ''
  ).replace(/\D/g, '')
}
