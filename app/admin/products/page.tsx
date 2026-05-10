export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import AdminProductsClient from '@/components/admin/AdminProductsClient'

async function getProducts(searchParams: { search?: string; category?: string; page?: string }) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (searchParams.search) query = query.ilike('name', `%${searchParams.search}%`)
  if (searchParams.category) query = query.eq('category', searchParams.category)
  query = query.range(offset, offset + limit - 1)

  const { data, count } = await query
  return { products: data || [], count: count || 0, page, limit }
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; page?: string }
}) {
  const { products, count, page, limit } = await getProducts(searchParams)
  const totalPages = Math.ceil(count / limit)

  return (
    <AdminProductsClient
      products={products as any}
      count={count}
      page={page}
      totalPages={totalPages}
      searchParams={{ search: searchParams.search, category: searchParams.category }}
    />
  )
}
