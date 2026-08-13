/**
 * Meta Pixel ID — must be available where you inject the snippet.
 *
 * - `NEXT_PUBLIC_FB_PIXEL_ID` — inlined in the **browser bundle at build time**.
 *   Set this in Vercel and **redeploy** after adding/changing it.
 * - `FACEBOOK_PIXEL_ID` — read only on the **server** (layout); use if you prefer not to
 *   duplicate NEXT_PUBLIC; still requires redeploy on Vercel for static exports.
 */
export function getPixelIdForServer(): string {
  return (
    process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ||
    process.env.FACEBOOK_PIXEL_ID?.trim() ||
    ''
  )
}

/** Client bundle (SPA PageView) — only NEXT_PUBLIC_* is visible here. */
export function getPixelIdForClient(): string {
  return process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ''
}
