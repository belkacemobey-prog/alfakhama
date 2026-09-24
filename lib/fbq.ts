declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    __META_TEST_EVENT_CODE?: string
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

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m?.[1] ? decodeURIComponent(m[1]) : undefined
}

function getTestEventCode(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return (
      window.__META_TEST_EVENT_CODE ||
      sessionStorage.getItem('meta_test_event_code') ||
      undefined
    )?.trim() || undefined
  } catch {
    return window.__META_TEST_EVENT_CODE
  }
}

/** Send event via Conversions API (appears in Meta Test Events even with adblock). */
async function sendCapi(payload: Record<string, unknown>) {
  try {
    const testCode = getTestEventCode()
    const res = await fetch('/api/meta/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        test_event_code: testCode,
        client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.warn('[meta-capi]', json)
      return false
    }
    return true
  } catch (err) {
    console.warn('[meta-capi]', err)
    return false
  }
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
 * Browser pixel + Conversions API (deduped by event_id = orderId).
 */
export async function trackPurchase(input: PurchaseTrackInput): Promise<boolean> {
  if (!input.orderId) return false
  if (wasPurchaseTracked(input.orderId)) return true

  const params: Record<string, unknown> = {
    value: Number(input.value) || 0,
    currency: input.currency || 'TND',
    content_type: 'product',
  }
  if (input.contentIds?.length) params.content_ids = input.contentIds
  if (input.contents?.length) params.contents = input.contents
  if (input.numItems != null) params.num_items = input.numItems

  const ready = await waitForFbq(5000)
  if (ready && typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', params, { eventID: input.orderId })
  } else {
    console.warn('[meta-pixel] browser Purchase delayed/skipped — sending CAPI')
  }

  await sendCapi({
    event_name: 'Purchase',
    event_id: input.orderId,
    value: params.value,
    currency: params.currency,
    content_ids: input.contentIds,
    contents: input.contents,
    num_items: input.numItems,
  })

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
  if (ready && typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: Number(params.value) || 0,
      currency: params.currency || 'TND',
      num_items: params.numItems,
      content_ids: params.contentIds,
      content_type: 'product',
    })
  }

  await sendCapi({
    event_name: 'InitiateCheckout',
    event_id: `ic_${Date.now()}`,
    value: params.value,
    currency: params.currency || 'TND',
    content_ids: params.contentIds,
    num_items: params.numItems,
  })
  return true
}

/** PageView via CAPI when Test Event code is active (makes Test Events show activity). */
export async function trackPageViewCapi() {
  if (!getTestEventCode()) return false
  return sendCapi({
    event_name: 'PageView',
    event_id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  })
}
