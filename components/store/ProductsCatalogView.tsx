'use client'

import ProductCard from '@/components/store/ProductCard'
import ProductSortSelect from '@/components/store/ProductSortSelect'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import { BRANDS, CATEGORIES } from '@/lib/utils'
import { categoryDisplayName } from '@/lib/store-i18n'
import type { Product } from '@/lib/supabase'
import { SlidersHorizontal, Search } from 'lucide-react'

type Props = {
  products: Product[]
  count: number
  page: number
  limit: number
  activeCategoryResolved: string
  activeBrand: string
  searchRaw?: string
  activeSort: string
}

function buildListingUrl(
  params: Record<string, string>,
  sticky: Pick<Props, 'activeCategoryResolved' | 'activeBrand' | 'searchRaw'>
) {
  const p = new URLSearchParams()
  if (sticky.activeCategoryResolved) p.set('category', sticky.activeCategoryResolved)
  if (sticky.activeBrand) p.set('brand', sticky.activeBrand)
  if (sticky.searchRaw) p.set('search', sticky.searchRaw)
  Object.entries(params).forEach(([k, v]) => {
    if (v) p.set(k, v)
    else p.delete(k)
  })
  return `/products?${p.toString()}`
}

export default function ProductsCatalogView({
  products,
  count,
  page,
  limit,
  activeCategoryResolved,
  activeBrand,
  searchRaw,
  activeSort,
}: Props) {
  const { t, locale } = useStoreLanguage()
  const activeCategory = activeCategoryResolved

  const sticky = { activeCategoryResolved, activeBrand, searchRaw }

  const buildUrl = (params: Record<string, string>) => buildListingUrl(params, sticky)

  const hrefBySort = {
    newest: buildUrl({ sort: '' }),
    price_asc: buildUrl({ sort: 'price_asc' }),
    price_desc: buildUrl({ sort: 'price_desc' }),
    rating: buildUrl({ sort: 'rating' }),
  }

  const totalPages = Math.ceil(count / limit)

  const catRow = activeCategory ? CATEGORIES.find(c => c.name === activeCategory) : undefined

  const pageTitle = catRow
    ? categoryDisplayName(catRow, locale)
    : activeCategory
      ? activeCategory
      : t('products.titleAll')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{pageTitle}</h1>
        <p className="text-subtle text-sm mt-1">{t('products.foundCount', { count })}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="card rounded-2xl shadow-card p-4 sticky top-32 border border-[var(--border-card)]">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[var(--cyan)]" />
              {t('products.filters')}
            </h3>

            <div className="mb-6">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {t('products.categoriesLbl')}
              </p>
              <div className="space-y-1">
                <a
                  href={buildUrl({ category: '' })}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                >
                  {t('products.allCats')}
                </a>
                {CATEGORIES.map(cat => (
                  <a
                    key={cat.slug}
                    href={buildUrl({ category: cat.name })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat.name
                        ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {categoryDisplayName(cat, locale)}
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {t('products.brandsLbl')}
              </p>
              <div className="space-y-1">
                <a
                  href={buildUrl({ brand: '' })}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!activeBrand ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
                >
                  {t('products.allBrands')}
                </a>
                {BRANDS.map(brand => (
                  <a
                    key={brand}
                    href={buildUrl({ brand })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeBrand === brand
                        ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {brand}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 card rounded-xl shadow-card px-4 py-3 border border-[var(--border-card)]">
            <p className="text-sm text-[var(--text-secondary)]">
              {searchRaw && (
                <span>
                  {t('products.resultsFor')} &quot;<strong className="text-[var(--text-primary)]">{searchRaw}</strong>
                  &quot; —{' '}
                </span>
              )}
              <strong className="text-[var(--text-primary)]">{count}</strong> {t('products.countLabel')}
            </p>
            <ProductSortSelect value={activeSort} hrefBySort={hrefBySort} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-[var(--border-card)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('products.none')}</h3>
              <p className="text-subtle">{t('products.noneHint')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {page > 1 && (
                    <a
                      href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 rounded-xl card text-sm font-medium text-[var(--text-primary)] border border-[var(--border-card)] hover:border-[var(--cyan)] transition-colors"
                    >
                      {t('products.prev')}
                    </a>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <a
                        key={p}
                        href={buildUrl({ page: String(p) })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-primary text-primary-foreground'
                            : 'card text-[var(--text-primary)] border border-[var(--border-card)] hover:border-[var(--cyan)]'
                        }`}
                      >
                        {p}
                      </a>
                    )
                  })}
                  {page < totalPages && (
                    <a
                      href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 rounded-xl card text-sm font-medium text-[var(--text-primary)] border border-[var(--border-card)] hover:border-[var(--cyan)] transition-colors"
                    >
                      {t('products.next')}
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
