'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Product } from '@/lib/supabase'
import { formatPrice, getDiscountPercent, CATEGORIES } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import { ShoppingCart, Star, ZoomIn, Truck, ShieldCheck, RefreshCw, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ProductCard from '@/components/store/ProductCard'
import { toast } from 'sonner'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import {
  categoryDisplayName,
  productDisplayDescription,
  productDisplayName,
  stockLabelForLocale,
} from '@/lib/store-i18n'

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCartStore()
  const { locale, t } = useStoreLanguage()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single()

      if (data) {
        setProduct(data as Product)
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(4)
        setRelated((rel as Product[]) || [])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton rounded-xl w-3/4" />
            <div className="h-4 skeleton rounded-xl w-1/2" />
            <div className="h-10 skeleton rounded-xl w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('product.notFound')}</h2>
        <Link href="/products" className="text-[var(--cyan)] mt-4 inline-block hover:opacity-80 transition-opacity">
          {t('product.backProducts')}
        </Link>
      </div>
    )
  }

  const displayTitle = productDisplayName(product, locale)
  const catRow = CATEGORIES.find(c => c.name === product.category)
  const catLabel = catRow ? categoryDisplayName(catRow, locale) : product.category || ''
  const altSubtitle =
    locale === 'ar'
      ? product.name?.trim() || null
      : product.name_ar?.trim() || null
  const description = productDisplayDescription(product, locale)
  const discount = product.original_price ? getDiscountPercent(product.price, product.original_price) : 0
  const stockInfo = stockLabelForLocale(product.stock, locale)

  const handleAddToCart = () => {
    if (product.stock === 0) return
    addItem(product, quantity)
    toast.success(t('toast.addedTitle'), {
      description: t('toast.addedDesc', { qty: quantity, name: displayTitle }),
    })
  }

  const images =
    product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6 flex-wrap">
        <Link href="/" className="hover:text-[var(--cyan)] transition-colors">
          {t('breadcrumb.home')}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[var(--cyan)] transition-colors">
          {t('breadcrumb.products')}
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[var(--cyan)] transition-colors"
        >
          {catLabel}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium truncate max-w-xs">{displayTitle}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div>
          <div
            className="relative aspect-square bg-[#060C18] rounded-2xl overflow-hidden cursor-zoom-in mb-3 border border-[var(--border-card)]"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={images[selectedImage]}
              alt={displayTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
            />
            <div className="absolute top-3 right-3 bg-[var(--bg-card)]/90 border border-[var(--border-card)] rounded-full p-1.5">
              <ZoomIn className="w-4 h-4 text-[var(--cyan)]" />
            </div>
            {discount > 0 && (
              <div className="absolute top-3 left-3 badge-promo text-sm">-{discount}%</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImage ? 'border-[var(--cyan)]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover bg-[#060C18]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-[var(--text-category)] uppercase tracking-wider font-bold mb-1">
            {(catLabel || product.brand || '').toUpperCase()}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-2 leading-tight">
            {displayTitle}
          </h1>
          {altSubtitle && altSubtitle !== displayTitle && (
            <p
              className="text-lg text-[var(--text-secondary)] mb-3 opacity-90"
              dir={locale === 'ar' ? 'ltr' : 'rtl'}
            >
              {altSubtitle}
            </p>
          )}

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating)
                        ? 'fill-current text-[var(--text-stars)]'
                        : 'fill-current text-[var(--border-card)]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{product.rating}</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {t('product.reviewsCount', { count: product.reviews_count })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-3xl font-extrabold text-[var(--text-price)]">{formatPrice(product.price)}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-[var(--text-old-price)] line-through">
                  {formatPrice(product.original_price)}
                </span>
                <span className="badge-promo text-sm">
                  {t('product.saveAmount', { amount: formatPrice(product.original_price - product.price) })}
                </span>
              </>
            )}
          </div>

          <div className={`flex items-center gap-2 mb-6 text-sm font-semibold ${stockInfo.color}`}>
            <div
              className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-orange-500' : 'bg-green-500'}`}
            />
            {stockInfo.label}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-[var(--text-secondary)]">{t('product.qty')}</span>
            <div className="flex items-center border border-[var(--border-card)] rounded-xl overflow-hidden bg-[var(--bg-input)]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-lg text-[var(--text-primary)]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-8 flex-wrap">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base min-w-[200px] ${
                product.stock === 0 ? 'bg-[var(--border-card)] text-[var(--text-secondary)] cursor-not-allowed' : 'btn-primary'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? t('product.stockOut') : t('product.addToCart')}
            </button>
            <Link
              href={`/checkout`}
              onClick={() => addItem(product, quantity)}
              className="btn-secondary flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold"
            >
              {t('product.order')}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Truck, text: t('trust.deliveryMini') },
              { icon: ShieldCheck, text: t('trust.warrantyMini') },
              { icon: RefreshCw, text: t('trust.returnMini') },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-[var(--cyan)] mx-auto mb-1" />
                <p className="text-xs text-[var(--text-secondary)] font-medium">{text}</p>
              </div>
            ))}
          </div>

          {description && (
            <div className="border-t border-[var(--border-card)] pt-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-2">{t('product.description')}</h3>
              <p
                className="text-[var(--text-secondary)] leading-relaxed text-sm"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-6">{t('product.similar')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={images[selectedImage]}
              alt={displayTitle}
              className="max-w-full max-h-full object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
