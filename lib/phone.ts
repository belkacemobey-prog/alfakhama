/** Digits only for tel: / wa.me links */
export function phoneDigits(raw: string | null | undefined): string {
  return (raw || '').replace(/\D/g, '')
}

/** Display with spaces when possible (TN-style) */
export function formatPhoneDisplay(raw: string | null | undefined, fallback = '+216 71 000 000'): string {
  const digits = phoneDigits(raw)
  if (!digits) return fallback
  if (digits.startsWith('216') && digits.length >= 11) {
    const rest = digits.slice(3)
    return `+216 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`.trim()
  }
  if (digits.length === 8) {
    return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }
  return raw?.trim() || fallback
}

export function telHref(raw: string | null | undefined): string {
  const digits = phoneDigits(raw)
  return digits ? `tel:+${digits}` : 'tel:+21671000000'
}

export function waMeUrl(raw: string | null | undefined, message?: string): string {
  const digits = phoneDigits(raw) || '21698000000'
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export const DEFAULT_STORE_PHONE = '+21671000000'
export const DEFAULT_WHATSAPP = '+21698000000'
