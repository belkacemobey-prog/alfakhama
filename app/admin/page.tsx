export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import AdminDashboardView from '@/components/admin/AdminDashboardView'

async function getDashboardData() {
  const supabase = createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [allOrdersResp, products, pendingOrders, recentOrders] = await Promise.all([
    supabase.from('orders').select('id, total_amount, status, created_at'),
    supabase.from('products').select('id, stock, is_active'),
    supabase.from('orders').select('id').eq('status', 'pending'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
  ])

  const orders = allOrdersResp.data || []
  const todayOrders = orders.filter(o => o.created_at >= todayStart)
  const monthOrders = orders.filter(o => o.created_at >= monthStart)
  const weekOrders = orders.filter(o => o.created_at >= weekStart)

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
    recentOrders: recentOrders.data || [],
    allOrders: orders,
  }
}

export default async function AdminDashboard() {
  const { stats, recentOrders, allOrders } = await getDashboardData()

  return <AdminDashboardView stats={stats} recentOrders={recentOrders as any} allOrders={allOrders as any} />
}
