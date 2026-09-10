import type { CartItem } from '@/lib/cart-store'
import type { Product, ProductOptionGroup } from '@/lib/supabase'

export const DEFAULT_DELIVERY_FEE = 7
export const FREE_DELIVERY_THRESHOLD = 500

export function normalizeProductOptions(raw: unknown): ProductOptionGroup[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const row = item as { name?: unknown; values?: unknown }
      const name = typeof row.name === 'string' ? row.name.trim() : ''
      const values = Array.isArray(row.values)
        ? row.values.map(v => String(v).trim()).filter(Boolean)
        : []
      if (!name || values.length === 0) return null
      return { name, values }
    })
    .filter((g): g is ProductOptionGroup => Boolean(g))
}

export function productDeliveryFee(product: Pick<Product, 'delivery_fee'> | null | undefined): number {
  const fee = product?.delivery_fee
  if (fee == null || Number.isNaN(Number(fee))) return DEFAULT_DELIVERY_FEE
  return Math.max(0, Number(fee))
}

/** Order delivery = max product fee; free when subtotal reaches threshold. */
export function calcCartDeliveryFee(items: CartItem[], subtotal: number): number {
  if (items.length === 0) return 0
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return Math.max(...items.map(i => productDeliveryFee(i.product)))
}

export function cartLineKey(productId: string, selectedOptions: Record<string, string> = {}): string {
  const parts = Object.entries(selectedOptions)
    .filter(([, v]) => Boolean(v))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
  return parts.length ? `${productId}::${parts.join('|')}` : productId
}

export function formatSelectedOptions(selected: Record<string, string> | null | undefined): string {
  if (!selected || Object.keys(selected).length === 0) return ''
  return Object.entries(selected)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

export function optionsLabel(product: Pick<Product, 'options'> | null | undefined): ProductOptionGroup[] {
  return normalizeProductOptions(product?.options)
}
