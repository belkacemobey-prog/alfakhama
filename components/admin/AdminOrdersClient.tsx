'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { formatPrice, ORDER_STATUSES } from '@/lib/utils'
import { Eye, Download } from 'lucide-react'
import AdminOrdersFilters from '@/components/admin/AdminOrdersFilters'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'
import { adminOrderStatusLabel } from '@/lib/admin-i18n'

export type AdminOrderRow = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  governorate_name: string | null
  total_amount: number
  status: string
  created_at: string
}

function buildOrdersUrl(
  searchParams: { status?: string; governorate?: string; search?: string },
  updates: Record<string, string | undefined>
) {
  const p = new URLSearchParams()
  if (searchParams.status) p.set('status', searchParams.status)
  if (searchParams.governorate) p.set('governorate', searchParams.governorate)
  if (searchParams.search) p.set('search', searchParams.search)

  for (const [key, val] of Object.entries(updates)) {
    if (val === undefined || val === '') p.delete(key)
    else p.set(key, val)
  }

  const qs = p.toString()
  return qs ? `/admin/orders?${qs}` : '/admin/orders'
}

export default function AdminOrdersClient({
  orders,
  count,
  page,
  totalPages,
  searchParams,
  exportPdfHref,
}: {
  orders: AdminOrderRow[]
  count: number
  page: number
  totalPages: number
  searchParams: { status?: string; governorate?: string; search?: string }
  exportPdfHref: string
}) {
  const { locale, t } = useAdminLanguage()

  const colKeys = [
    'orders.col.number',
    'orders.col.client',
    'orders.col.phone',
    'orders.col.gov',
    'orders.col.amount',
    'orders.col.status',
    'orders.col.date',
    'orders.col.actions',
  ] as const

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-secondary">{t('orders.title', { count })}</h1>
        <a href={exportPdfHref} className="inline-flex items-center gap-2 btn-outline text-sm py-2 px-3">
          <Download className="w-4 h-4" />
          {t('orders.exportPdf')}
        </a>
      </div>

      <Suspense fallback={<div className="card p-4 h-12 skeleton rounded-xl animate-pulse bg-gray-100" />}>
        <AdminOrdersFilters />
      </Suspense>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildOrdersUrl(searchParams, { status: undefined, page: undefined })}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !searchParams.status ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('orders.allStatuses')}
        </Link>
        {Object.entries(ORDER_STATUSES).map(([k, v]) => (
          <Link
            key={k}
            href={buildOrdersUrl(searchParams, { status: k, page: undefined })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              searchParams.status === k ? v.color + ' font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {adminOrderStatusLabel(locale, k)}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {colKeys.map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    {t('orders.none')}
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-secondary">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.customer_phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.governorate_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color
                        }`}
                      >
                        {adminOrderStatusLabel(locale, order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-TN' : 'fr-TN')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {page > 1 && (
            <Link
              href={buildOrdersUrl(searchParams, { page: String(page - 1) })}
              className="px-3 py-1.5 bg-white rounded-lg shadow-card text-sm hover:bg-gray-50"
            >
              {t('orders.prev')}
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <Link
              key={i + 1}
              href={buildOrdersUrl(searchParams, { page: String(i + 1) })}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                i + 1 === page ? 'bg-primary text-primary-foreground' : 'bg-white shadow-card hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={buildOrdersUrl(searchParams, { page: String(page + 1) })}
              className="px-3 py-1.5 bg-white rounded-lg shadow-card text-sm hover:bg-gray-50"
            >
              {t('orders.next')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
