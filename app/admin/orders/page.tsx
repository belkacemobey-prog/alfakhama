export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import AdminOrdersClient from '@/components/admin/AdminOrdersClient'

interface SearchParams {
  status?: string
  governorate?: string
  search?: string
  page?: string
}

async function getOrders(searchParams: SearchParams) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 25
  const offset = (page - 1) * limit

  let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.governorate) query = query.eq('governorate_name', searchParams.governorate)
  if (searchParams.search) {
    query = query.or(
      `customer_name.ilike.%${searchParams.search}%,customer_phone.ilike.%${searchParams.search}%,order_number.ilike.%${searchParams.search}%`
    )
  }

  query = query.range(offset, offset + limit - 1)
  const { data, count } = await query
  return { orders: data || [], count: count || 0, page, limit }
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { orders, count, page, limit } = await getOrders(searchParams)
  const totalPages = Math.ceil(count / limit)

  const exportPdfHref = (() => {
    const p = new URLSearchParams()
    if (searchParams.status) p.set('status', searchParams.status)
    if (searchParams.governorate) p.set('governorate', searchParams.governorate)
    if (searchParams.search) p.set('search', searchParams.search)
    const qs = p.toString()
    return qs ? `/admin/orders/export?${qs}` : '/admin/orders/export'
  })()

  return (
    <AdminOrdersClient
      orders={orders as any}
      count={count}
      page={page}
      totalPages={totalPages}
      searchParams={{
        status: searchParams.status,
        governorate: searchParams.governorate,
        search: searchParams.search,
      }}
      exportPdfHref={exportPdfHref}
    />
  )
}
