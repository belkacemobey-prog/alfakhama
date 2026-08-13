'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit2, Eye, EyeOff, Package } from 'lucide-react'
import type { Product } from '@/lib/supabase'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

function buildProductsQuery(search: { search?: string; category?: string }) {
  const p = new URLSearchParams()
  if (search.search) p.set('search', search.search)
  if (search.category) p.set('category', search.category)
  return p.toString()
}

export default function AdminProductsClient({
  products,
  count,
  page,
  totalPages,
  searchParams,
}: {
  products: Product[]
  count: number
  page: number
  totalPages: number
  searchParams: { search?: string; category?: string }
}) {
  const { t } = useAdminLanguage()
  const qs = buildProductsQuery(searchParams)

  const pageHref = (p: number) => {
    const params = new URLSearchParams(qs)
    params.set('page', String(p))
    const s = params.toString()
    return s ? `/admin/products?${s}` : `/admin/products?page=${p}`
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-secondary">{t('products.title', { count })}</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('products.new')}
        </Link>
      </div>

      <form action="/admin/products" method="get" className="card p-4 flex flex-wrap gap-3 items-end">
        <input type="hidden" name="category" defaultValue={searchParams.category ?? ''} />
        <div className="flex-1 min-w-40">
          <label className="sr-only" htmlFor="admin-products-search">
            Search
          </label>
          <input
            id="admin-products-search"
            type="text"
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder={t('products.searchPlaceholder')}
            className="input-field w-full py-2 text-sm"
          />
        </div>
        <button type="submit" className="btn-outline text-sm py-2 px-4">
          {t('products.searchSubmit')}
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  'products.col.image',
                  'products.col.name',
                  'products.col.cat',
                  'products.col.brand',
                  'products.col.price',
                  'products.col.stock',
                  'products.col.status',
                  'products.col.actions',
                ].map(key => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">{t('products.none')}</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300 m-3" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 max-w-xs truncate">{product.name}</p>
                      {product.is_featured && (
                        <span className="text-xs text-primary font-medium">{t('products.featured')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                      {product.original_price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold ${
                          product.stock === 0
                            ? 'text-red-500'
                            : product.stock <= 5
                              ? 'text-orange-500'
                              : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {product.is_active ? t('products.active') : t('products.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary inline-flex"
                      >
                        <Edit2 className="w-4 h-4" />
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
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
            <Link
              key={i + 1}
              href={pageHref(i + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                i + 1 === page ? 'bg-primary text-primary-foreground' : 'bg-white shadow-card hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
