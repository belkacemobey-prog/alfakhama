declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

export function isFbqReady(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/** Wait until Meta Pixel script has loaded (Purchase was lost when fired too early). */
export function waitForFbq(timeoutMs = 10000): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (typeof window.fbq === 'function') return Promise.resolve(true)

  return new Promise(resolve => {
    const started = Date.now()
    const tick = window.setInterval(() => {
      if (typeof window.fbq === 'function') {
        window.clearInterval(tick)
        resolve(true)
        return
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(tick)
        resolve(false)
      }
    }, 80)
  })
}

export function fbq(...args: unknown[]) {
  if (isFbqReady()) window.fbq!(...args)
}

export type PurchaseTrackInput = {
  orderId: string
  value: number
  currency?: string
  contentIds?: string[]
  contents?: { id: string; quantity: number; item_price?: number }[]
  numItems?: number
}

function purchaseKey(orderId: string) {
  return `fb_purchase_${orderId}`
}

export function wasPurchaseTracked(orderId: string): boolean {
  try {
    return sessionStorage.getItem(purchaseKey(orderId)) === '1'
  } catch {
    return false
  }
}

export function markPurchaseTracked(orderId: string) {
  try {
    sessionStorage.setItem(purchaseKey(orderId), '1')
  } catch {
    /* ignore */
  }
}

/**
 * Fire standard Purchase for Meta Events Manager / Test Events.
 * Retries until fbq is ready; dedupes per orderId in sessionStorage.
 */
export async function trackPurchase(input: PurchaseTrackInput): Promise<boolean> {
  if (!input.orderId) return false
  if (wasPurchaseTracked(input.orderId)) return true

  const ready = await waitForFbq()
  if (!ready || typeof window.fbq !== 'function') {
    console.warn('[meta-pixel] Purchase skipped — fbq not ready')
    return false
  }

  const params: Record<string, unknown> = {
    value: Number(input.value) || 0,
    currency: input.currency || 'TND',
    content_type: 'product',
  }
  if (input.contentIds?.length) params.content_ids = input.contentIds
  if (input.contents?.length) params.contents = input.contents
  if (input.numItems != null) params.num_items = input.numItems

  // eventID = order id for future CAPI dedup
  window.fbq('track', 'Purchase', params, { eventID: input.orderId })
  markPurchaseTracked(input.orderId)
  return true
}

export async function trackInitiateCheckout(params: {
  value: number
  currency?: string
  numItems?: number
  contentIds?: string[]
}) {
  const ready = await waitForFbq()
  if (!ready || typeof window.fbq !== 'function') return false
  window.fbq('track', 'InitiateCheckout', {
    value: Number(params.value) || 0,
    currency: params.currency || 'TND',
    num_items: params.numItems,
    content_ids: params.contentIds,
    content_type: 'product',
  })
  return true
}
