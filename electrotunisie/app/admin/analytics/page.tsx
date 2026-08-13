export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'
import AnalyticsCharts from './AnalyticsCharts'

async function getAnalyticsData() {
  const supabase = createClient()
  const [ordersRes, itemsRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('order_items').select('product_name, quantity, total_price'),
  ])

  const orders = ordersRes.data || []
  const items = itemsRes.data || []

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter(o => o.status !== 'cancelled').length : 0

  // Top products
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {}
  items.forEach(item => {
    if (!productMap[item.product_name]) productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 }
    productMap[item.product_name].qty += item.quantity
    productMap[item.product_name].revenue += item.total_price
  })
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // By governorate
  const govMap: Record<string, number> = {}
  orders.forEach(o => {
    govMap[o.governorate_name] = (govMap[o.governorate_name] || 0) + 1
  })
  const byGovernorate = Object.entries(govMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return { orders, totalRevenue, avgOrderValue, topProducts, byGovernorate }
}

export default async function AdminAnalyticsPage() {
  const { orders, totalRevenue, avgOrderValue, topProducts, byGovernorate } = await getAnalyticsData()

  const kpis = [
    { label: 'Total commandes', value: orders.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Revenu total', value: formatPrice(totalRevenue), color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Valeur moy. commande', value: formatPrice(avgOrderValue), color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Taux de livraison', value: `${Math.round((orders.filter(o => o.status === 'delivered').length / (orders.length || 1)) * 100)}%`, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-secondary">Analytique</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className="text-lg">📊</span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts orders={orders as any} topProducts={topProducts} byGovernorate={byGovernorate} />

      {/* Top products table */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4">Top produits vendus</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Produit', 'Quantité', 'Revenu'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p, idx) => (
                <tr key={p.name} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-sm font-bold text-gray-400">#{idx + 1}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 max-w-xs truncate">{p.name}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{p.qty}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-primary">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By governorate */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4">Commandes par gouvernorat</h2>
        <div className="space-y-2">
          {byGovernorate.map(gov => {
            const maxCount = byGovernorate[0]?.count || 1
            return (
              <div key={gov.name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-28 flex-shrink-0">{gov.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(gov.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-secondary w-8 text-right">{gov.count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
