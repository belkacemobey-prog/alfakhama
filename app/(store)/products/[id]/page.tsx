'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Product, Governorate } from '@/lib/supabase'
import { formatPrice, getDiscountPercent, CATEGORIES, generateOrderNumber } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import {
  FREE_DELIVERY_THRESHOLD,
  optionsLabel,
  productDeliveryFee,
} from '@/lib/product-options'
import {
  ShoppingCart,
  Star,
  ZoomIn,
  Truck,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react'
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
  const router = useRouter()
  const { addItem } = useCartStore()
  const { locale, t } = useStoreLanguage()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    cityId: '',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const [{ data }, govRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', params.id).single(),
        supabase.from('governorates').select('*').order('id', { ascending: true }),
      ])

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
      setGovernorates((govRes.data as Governorate[]) || [])
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
  const description = productDisplayDescription(product, locale)
  const discount = product.original_price ? getDiscountPercent(product.price, product.original_price) : 0
  const stockInfo = stockLabelForLocale(product.stock, locale)
  const optionGroups = optionsLabel(product)
  const unitDelivery = productDeliveryFee(product)

  const allOptionsSelected =
    optionGroups.length === 0 || optionGroups.every(g => Boolean(selectedOptions[g.name]))

  const subtotal = product.price * quantity
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : unitDelivery
  const total = subtotal + deliveryFee
  const selectedGov = governorates.find(g => String(g.id) === form.cityId) || null

  const images =
    product.images?.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600']

  const handleAddToCart = () => {
    if (product.stock === 0) return
    if (!allOptionsSelected) {
      toast.error(t('product.optionsRequired'))
      return
    }
    addItem(product, quantity, selectedOptions)
    toast.success(t('toast.addedTitle'), {
      description: t('toast.addedDesc', { qty: quantity, name: displayTitle }),
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = t('checkout.err.name')
    if (!form.phone.trim()) next.phone = t('checkout.err.phone')
    else if (!/^[0-9]{8}$/.test(form.phone.replace(/\s/g, ''))) next.phone = t('checkout.err.phoneFmt')
    if (!form.cityId) next.city = t('checkout.err.gov')
    if (!allOptionsSelected) next.options = t('product.optionsRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (product.stock === 0) return
    if (!validate()) {
      toast.error(t('checkout.err.form'))
      return
    }
    setSubmitting(true)
    try {
      const orderNumber = generateOrderNumber()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: form.name.trim(),
          customer_phone: `+216${form.phone.trim()}`,
          customer_phone2: null,
          governorate_id: selectedGov!.id,
          governorate_name: selectedGov!.name_fr,
          address: form.address.trim() || null,
          notes: null,
          total_amount: total,
          delivery_fee: deliveryFee,
          payment_method: 'cash_on_delivery',
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const { error: itemsError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || null,
        quantity,
        unit_price: product.price,
        total_price: product.price * quantity,
        selected_options: selectedOptions || {},
      })
      if (itemsError) throw itemsError

      router.push(`/order-confirmation/${order.id}`)
    } catch (err) {
      console.error(err)
      toast.error(t('checkout.err.order'))
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--cyan)] text-sm'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6 flex-wrap">
        <Link href="/" className="hover:text-[var(--cyan)] transition-colors">
          {t('breadcrumb.home')}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium truncate max-w-xs">{displayTitle}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0 max-h-[480px] overflow-y-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    idx === selectedImage ? 'border-[var(--cyan)]' : 'border-[var(--border-card)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover bg-[#060C18]" />
                </button>
              ))}
            </div>
          )}
          <div
            className="relative flex-1 aspect-square max-h-[520px] bg-[#060C18] rounded-2xl overflow-hidden cursor-zoom-in border border-[var(--border-card)]"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={images[selectedImage]}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-[var(--bg-card)]/90 border border-[var(--border-card)] rounded-full p-1.5">
              <ZoomIn className="w-4 h-4 text-[var(--cyan)]" />
            </div>
            {discount > 0 && (
              <div className="absolute top-3 left-3 badge-promo text-sm">-{discount}%</div>
            )}
          </div>
        </div>

        {/* Info + express form */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
            {displayTitle}
          </h1>

          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-3xl font-extrabold text-[var(--text-price)]">{formatPrice(product.price)}</span>
            {product.original_price ? (
              <>
                <span className="text-lg text-[var(--text-old-price)] line-through">
                  {formatPrice(product.original_price)}
                </span>
                {discount > 0 && <span className="badge-promo text-sm">-{discount}%</span>}
              </>
            ) : null}
          </div>

          <div className={`flex items-center gap-2 mb-5 text-sm font-semibold ${stockInfo.color}`}>
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock === 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-orange-500' : 'bg-green-500'
              }`}
            />
            {stockInfo.label}
          </div>

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
              <span className="text-sm text-[var(--text-secondary)]">
                {t('product.reviewsCount', { count: product.reviews_count })}
              </span>
            </div>
          )}

          {optionGroups.length > 0 && (
            <div className="space-y-3 mb-5">
              {optionGroups.map(group => (
                <div key={group.name}>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">{group.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map(value => {
                      const active = selectedOptions[group.name] === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [group.name]: value }))}
                          className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                            active
                              ? 'border-[var(--cyan)] bg-[var(--cyan)]/15 text-[var(--cyan)]'
                              : 'border-[var(--border-card)] text-[var(--text-primary)]'
                          }`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              {errors.options ? <p className="text-red-500 text-xs">{errors.options}</p> : null}
            </div>
          )}

          {/* Inline order form — like the example */}
          <form onSubmit={handlePlaceOrder} className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">
                {t('checkout.fullName')}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('checkout.placeholder.name')}
                className={inputClass}
              />
              {errors.name ? <p className="text-red-500 text-xs mt-1">{errors.name}</p> : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">
                {t('checkout.phone')} <span className="text-[var(--cyan)]">*</span>
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-sm text-[var(--text-secondary)]">
                  +216
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={e =>
                    setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 8) }))
                  }
                  placeholder={t('checkout.placeholder.phone')}
                  className={inputClass}
                />
              </div>
              {errors.phone ? <p className="text-red-500 text-xs mt-1">{errors.phone}</p> : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">
                {t('product.city')}
              </label>
              <select
                value={form.cityId}
                onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('product.cityPh')}</option>
                {governorates.map(g => (
                  <option key={g.id} value={g.id}>
                    {locale === 'ar' ? g.name_ar : g.name_fr}
                  </option>
                ))}
              </select>
              {errors.city ? <p className="text-red-500 text-xs mt-1">{errors.city}</p> : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">
                {t('checkout.address')}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder={t('checkout.placeholder.address')}
                className={inputClass}
              />
            </div>

            <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{t('cart.subtotal')}</span>
                <span className="text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{t('cart.shipping')}</span>
                <span className="text-[var(--text-primary)]">
                  {deliveryFee === 0 ? t('cart.gratis') : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1.5 border-t border-[var(--border-card)]">
                <span className="text-[var(--text-primary)]">{t('cart.total')}</span>
                <span className="text-[var(--cyan)]">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center border border-[var(--border-card)] rounded-xl overflow-hidden bg-[var(--bg-input)]">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-[var(--text-primary)]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={product.stock === 0 || submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
              {product.stock === 0 ? t('product.stockOut') : t('product.placeOrder')}
            </button>
          </form>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base border-2 border-[var(--cyan)] text-[var(--cyan)] bg-transparent hover:bg-[var(--cyan)]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          >
            <ShoppingCart className="w-5 h-5" />
            {t('product.addToCart')}
          </button>

          {description ? (
            <div className="border-t border-[var(--border-card)] pt-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-2 uppercase text-sm tracking-wide">
                {t('product.description')}
              </h3>
              <p
                className="text-[var(--text-secondary)] leading-relaxed text-sm"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {description}
              </p>
              {catLabel ? (
                <p className="text-xs text-[var(--text-secondary)] mt-3">{catLabel}</p>
              ) : null}
            </div>
          ) : null}
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
