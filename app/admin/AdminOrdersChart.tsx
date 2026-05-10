'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

interface Order {
  id: string
  created_at: string
  total_amount: number
}

export default function AdminOrdersChart({ orders }: { orders: Order[] }) {
  const { locale, t } = useAdminLanguage()
  const dfLocale = locale === 'ar' ? ar : fr

  const days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr))
        return {
          date: format(date, 'd MMM', { locale: dfLocale }),
          commandes: dayOrders.length,
          revenus: dayOrders.reduce((s, o) => s + o.total_amount, 0),
        }
      }),
    [orders, dfLocale]
  )

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={days}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(v, i) => (i % 5 === 0 ? v : '')}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [
              value as number,
              String(name) === 'commandes' ? t('dash.chart.orders') : t('dash.chart.revenue'),
            ]}
          />
          <Line
            type="monotone"
            dataKey="commandes"
            stroke="#E63946"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
