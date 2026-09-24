'use client'

import Link from 'next/link'
import { formatPrice, ORDER_STATUSES } from '@/lib/utils'
import { ShoppingBag, Package, DollarSign, Clock } from 'lucide-react'
import AdminOrdersChart from '@/app/admin/AdminOrdersChart'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'
import { adminOrderStatusLabel } from '@/lib/admin-i18n'

type OrderRow = {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_number?: string
  customer_name?: string
}

export default function AdminDashboardView({
  stats,
  recentOrders,
  allOrders,
}: {
  stats: {
    ordersToday: number
    ordersWeek: number
    ordersMonth: number
    revenueToday: number
    revenueMonth: number
    pendingCount: number
    totalProducts: number
    outOfStock: number
  }
  recentOrders: OrderRow[]
  allOrders: Pick<OrderRow, 'id' | 'created_at' | 'total_amount' | 'status'>[]
}) {
  const { locale, t } = useAdminLanguage()

  const statusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    telecharge: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }
  for (const o of allOrders) {
    if (o.status in statusCounts) statusCounts[o.status] += 1
    else statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  }

  const kpis = [
    {
      title: t('dash.kpi.today'),
      value: stats.ordersToday,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: t('dash.kpi.todaySub', { n: stats.ordersWeek }),
    },
    {
      title: t('dash.kpi.pending'),
      value: stats.pendingCount,
      icon: Clock,
      color: stats.pendingCount > 0 ? 'text-red-600' : 'text-gray-600',
      bg: stats.pendingCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: t('dash.kpi.pendingSub'),
      urgent: stats.pendingCount > 0,
    },
    {
      title: t('dash.kpi.month'),
      value: formatPrice(stats.revenueMonth),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sub: t('dash.kpi.monthSub', { today: formatPrice(stats.revenueToday) }),
    },
    {
      title: t('dash.kpi.products'),
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: t('dash.kpi.productsSub', { n: stats.outOfStock }),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-secondary">{t('dash.title')}</h1>
        <Link href="/admin/orders" className="btn-primary text-sm py-2 px-4">
          {t('dash.viewOrders')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`card p-5 ${kpi.urgent ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{kpi.title}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs text-gray-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4">{t('dash.byStatus')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(ORDER_STATUSES).map(([key, status]) => (
            <Link
              key={key}
              href={`/admin/orders?status=${key}`}
              className={`text-center p-3 rounded-xl ${status.color} hover:opacity-90 transition-opacity`}
            >
              <p className="text-2xl font-bold">{statusCounts[key] ?? 0}</p>
              <p className="text-xs font-medium mt-1">{adminOrderStatusLabel(locale, key)}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-bold text-secondary mb-4">{t('dash.chart30')}</h2>
          <AdminOrdersChart orders={allOrders} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-secondary">{t('dash.recent')}</h2>
            <Link href="/admin/orders" className="text-xs text-primary font-medium">
              {t('dash.seeAll')}
            </Link>
          </div>
          <div className="space-y-3">
            {(recentOrders as OrderRow[]).map(order => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-secondary truncate">{order.order_number}</p>
                  <p className="text-xs text-gray-500 truncate">{order.customer_name}</p>
                </div>
                <div className="text-end shrink-0 ps-2">
                  <p className="text-xs font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                      ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color
                    }`}
                  >
                    {adminOrderStatusLabel(locale, order.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
