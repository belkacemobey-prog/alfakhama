'use client'

import { Product } from '@/lib/supabase'
import { formatPrice, getDiscountPercent, CATEGORIES } from '@/lib/utils'
import { optionsLabel } from '@/lib/product-options'
import { useCartStore } from '@/lib/cart-store'
import { ShoppingCart, Star, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import { categoryDisplayName, productDisplayName, stockLabelForLocale } from '@/lib/store-i18n'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem } = useCartStore()
  const router = useRouter()
  const { locale, t } = useStoreLanguage()
  const discount = product.original_price ? getDiscountPercent(product.price, product.original_price) : 0
  const stockInfo = stockLabelForLocale(product.stock, locale)
  const catRow = CATEGORIES.find(c => c.name === product.category)
  const categoryLabel = (
    catRow ? categoryDisplayName(catRow, locale) : product.category || product.brand || '—'
  ).toUpperCase()
  const title = productDisplayName(product, locale)
  const hasOptions = optionsLabel(product).length > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    if (hasOptions) {
      router.push(`/products/${product.id}`)
      return
    }
    addItem(product)
    toast.success(t('toast.addedNamed', { name: title }), {
      description: formatPrice(product.price),
    })
  }

  return (
    <div className={`product-card group relative ${className}`}>
      <Link href={`/products/${product.id}`} className="block">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rtl:left-auto rtl:right-3">
          {discount > 0 && <span className="badge-promo">-{discount}%</span>}
          {product.is_featured && !discount && <span className="badge-new">{t('badge.new')}</span>}
        </div>

        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] rtl:right-auto rtl:left-3">
          <div className="w-8 h-8 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full flex items-center justify-center hover:bg-[var(--bg-card-hover)]">
            <Eye className="w-4 h-4 text-[var(--text-primary)]" />
          </div>
        </div>

        <div className="h-[220px] overflow-hidden bg-[#060C18] rounded-t-[var(--radius-card)]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--border-card)]">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="p-4 pb-2">
          <p className="text-[11px] font-bold text-[var(--text-category)] uppercase tracking-[1px] mb-1">
            {categoryLabel}
          </p>
          <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-2 mb-2 leading-tight">
            {title}
          </h3>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex stars text-[13px]">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(product.rating)
                        ? 'fill-current text-[var(--text-stars)]'
                        : 'fill-current text-[var(--border-card)]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--text-secondary)]">({product.reviews_count})</span>
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <Link
          href={`/products/${product.id}`}
          className="flex flex-wrap items-baseline gap-2 min-w-0 flex-1"
        >
          <span className="text-[22px] font-extrabold text-[var(--text-price)] leading-none">
            {formatPrice(product.price)}
          </span>
          {product.original_price && (
            <span className="text-sm text-[var(--text-old-price)] line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="product-card-atc"
          aria-label={hasOptions ? t('product.chooseOnPage') : t('product.addToCartAria')}
          title={hasOptions ? t('product.chooseOnPage') : undefined}
        >
          <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2.25} />
        </button>
      </div>

      <div className="px-4 pb-3 -mt-1">
        <p className={`text-xs font-medium ${stockInfo.color}`}>{stockInfo.label}</p>
      </div>
    </div>
  )
}
