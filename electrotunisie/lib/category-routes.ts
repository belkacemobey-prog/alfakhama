import { CATEGORIES, slugify } from './utils'

/** Next.js may pass `searchParams` values as string | string[] */
export function queryFirst(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isProductUuid(segment: string): boolean {
  return UUID_RE.test(segment)
}

/** Resolve banner slugs / typos → DB category label (exact match stored on products.category). */
export function canonicalCategoryName(input: string): string | null {
  let decoded = input.trim()
  try {
    decoded = decodeURIComponent(decoded).trim()
  } catch {
    decoded = input.trim()
  }
  if (!decoded) return null
  const lower = decoded.toLowerCase()
  for (const c of CATEGORIES) {
    if (c.name === decoded) return c.name
    if (c.name.toLowerCase() === lower) return c.name
    if (c.slug.toLowerCase() === lower) return c.name
    if (slugify(c.name) === lower) return c.name
  }
  return null
}

/** Map /products/<segment> → category when segment is SEO slug / label (not UUID). */
export function categoryNameFromProductPathSegment(segment: string): string | null {
  const decoded = decodeURIComponent(segment).trim()
  if (!decoded || isProductUuid(decoded)) return null
  return canonicalCategoryName(decoded)
}
