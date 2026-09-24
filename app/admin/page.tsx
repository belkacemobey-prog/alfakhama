export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import AdminDashboardView from '@/components/admin/AdminDashboardView'

function effectiveOrderStatus(o: {
  status: string
  delivery_barcode?: string | null
  notes?: string | null
}) {
  if (o.status === 'telecharge') return 'telecharge'
  if (o.delivery_barcode) return 'telecharge'
  if (o.notes && /BestWay barcode:/i.test(o.notes)) return 'telecharge'
  return o.status
}

async function getDashboardData() {
  const supabase = createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [allOrdersResp, products, pendingOrders, recentOrders] = await Promise.all([
    supabase.from('orders').select('id, total_amount, status, created_at, notes, delivery_barcode'),
    supabase.from('products').select('id, stock, is_active'),
    supabase.from('orders').select('id').eq('status', 'pending'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
  ])

  // Si delivery_barcode n'existe pas encore en schéma, retomber sans cette colonne
  let orders = allOrdersResp.data || []
  if (allOrdersResp.error) {
    const fallback = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, notes')
    orders = fallback.data || []
  }

  const todayOrders = orders.filter(o => o.created_at >= todayStart)
  const monthOrders = orders.filter(o => o.created_at >= monthStart)
  const weekOrders = orders.filter(o => o.created_at >= weekStart)

  const normalized = orders.map(o => ({
    ...o,
    status: effectiveOrderStatus(o as any),
  }))

  const recent = (recentOrders.data || []).map(o => ({
    ...o,
    status: effectiveOrderStatus(o as any),
  }))

  const prods = products.data || []

  return {
    stats: {
      ordersToday: todayOrders.length,
      ordersWeek: weekOrders.length,
      ordersMonth: monthOrders.length,
      revenueToday: todayOrders.reduce((s, o) => s + o.total_amount, 0),
      revenueMonth: monthOrders.reduce((s, o) => s + o.total_amount, 0),
      pendingCount: pendingOrders.data?.length || 0,
      totalProducts: prods.length,
      outOfStock: prods.filter(p => p.stock === 0).length,
    },
    recentOrders: recent,
    allOrders: normalized,
  }
}

export default async function AdminDashboard() {
  const { stats, recentOrders, allOrders } = await getDashboardData()

  return <AdminDashboardView stats={stats} recentOrders={recentOrders as any} allOrders={allOrders as any} />
}
