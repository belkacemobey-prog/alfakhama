export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import ProductsCatalogView from '@/components/store/ProductsCatalogView'
import { queryFirst, canonicalCategoryName } from '@/lib/category-routes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tous les Produits',
  description:
    'Parcourez notre catalogue d\'électroménager. Réfrigérateurs, lave-linge, climatiseurs, téléviseurs et plus.',
}

interface ProductSearchParams {
  category?: string
  brand?: string
  search?: string
  page?: string
  featured?: string
  sort?: string
}

async function getProducts(searchParams: ProductSearchParams) {
  const supabase = createClient()
  const pageRaw = parseInt(searchParams.page || '1', 10)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (searchParams.category) {
    const resolved = canonicalCategoryName(searchParams.category) ?? searchParams.category
    query = query.eq('category', resolved)
  }
  if (searchParams.brand) {
    query = query.eq('brand', searchParams.brand)
  }
  if (searchParams.search) {
    const term = searchParams.search
    query = query.or(`name.ilike.%${term}%,name_ar.ilike.%${term}%`)
  }
  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count } = await query
  return { products: data || [], count: count || 0, page, limit }
}

export default async function ProductsPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const searchParams: ProductSearchParams = {
    category: queryFirst(rawSearchParams.category),
    brand: queryFirst(rawSearchParams.brand),
    search: queryFirst(rawSearchParams.search),
    page: queryFirst(rawSearchParams.page),
    featured: queryFirst(rawSearchParams.featured),
    sort: queryFirst(rawSearchParams.sort),
  }

  const { products, count, page, limit } = await getProducts(searchParams)

  const activeCategoryResolved = searchParams.category
    ? canonicalCategoryName(searchParams.category) ?? searchParams.category
    : ''

  return (
    <ProductsCatalogView
      products={products as any}
      count={count}
      page={page}
      limit={limit}
      activeCategoryResolved={activeCategoryResolved}
      activeBrand={searchParams.brand || ''}
      searchRaw={searchParams.search}
      activeSort={searchParams.sort || 'newest'}
    />
  )
}
