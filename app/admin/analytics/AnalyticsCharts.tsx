'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatPrice } from '@/lib/utils'

const COLORS = ['#E63946', '#1D3557', '#F4A261', '#2D6A4F', '#457B9D', '#E76F51']

export default function AnalyticsCharts({
  orders,
  topProducts,
  byGovernorate,
}: {
  orders: any[]
  topProducts: any[]
  byGovernorate: any[]
}) {
  // Revenue per week (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = subDays(new Date(), (7 - i) * 7 + new Date().getDay())
    const weekEnd = subDays(new Date(), (7 - i - 1) * 7 + new Date().getDay())
    const weekOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d >= weekStart && d <= weekEnd && o.status !== 'cancelled'
    })
    return {
      week: `S${i + 1}`,
      revenus: weekOrders.reduce((s: number, o: any) => s + o.total_amount, 0),
      commandes: weekOrders.length,
    }
  })

  // Daily orders (last 14 days)
  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr))
    return {
      date: format(date, 'd MMM', { locale: fr }),
      commandes: dayOrders.length,
    }
  })

  // Top 5 governorates for pie
  const pieData = byGovernorate.slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line chart: daily orders */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4 text-sm">Commandes journalières (14 jours)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="commandes" stroke="#E63946" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart: weekly revenue */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4 text-sm">Revenus hebdomadaires (8 semaines)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [formatPrice(Number(v)), 'Revenus']} />
              <Bar dataKey="revenus" fill="#E63946" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie: by governorate */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4 text-sm">Top 5 gouvernorats</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="count"
                nameKey="name"
                paddingAngle={3}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend formatter={(v) => v} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products bar */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-4 text-sm">Top 5 produits (revenus)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts.slice(0, 5)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v: any) => [formatPrice(Number(v)), 'Revenus']} />
              <Bar dataKey="revenue" fill="#1D3557" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
