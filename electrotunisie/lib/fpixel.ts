/**
 * Meta (Facebook) Pixel helpers for ad campaigns + Events Manager.
 * Set NEXT_PUBLIC_FB_PIXEL_ID in .env / Vercel.
 */
import { getPixelIdForClient } from '@/lib/pixel-config'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export const FB_PIXEL_ID = getPixelIdForClient()

export function isFbqReady(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/** Standard page view (also fired automatically on route change by FacebookPixel). */
export function trackFbqPageView() {
  if (isFbqReady()) window.fbq!('track', 'PageView')
}

/** Custom events: ViewContent, AddToCart, InitiateCheckout, Purchase, etc. */
export function trackFbqEvent(
  event: string,
  params?: Record<string, string | number | string[] | undefined>
) {
  if (isFbqReady()) window.fbq!('track', event, params)
}

/** For Custom conversions / parameters object shape Meta accepts */
export function trackFbqCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (isFbqReady()) window.fbq!('trackCustom', eventName, params)
}
