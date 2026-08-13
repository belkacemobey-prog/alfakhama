import { getPixelIdForServer } from '@/lib/pixel-config'

/** Fallback pixel image when JS is disabled (recommended by Meta). */
export default function FacebookPixelNoscript() {
  const id = getPixelIdForServer()
  const safeId = id.replace(/\D/g, '')
  if (!safeId) return null

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${encodeURIComponent(safeId)}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}
