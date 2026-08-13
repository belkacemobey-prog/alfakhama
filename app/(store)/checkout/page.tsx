'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { supabase, Governorate } from '@/lib/supabase'
import { formatPrice, generateOrderNumber } from '@/lib/utils'
import GovernorateCarousel from '@/components/store/GovernorateCarousel'
import { toast } from 'sonner'
import { ShoppingCart, User, MapPin, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import { productDisplayName } from '@/lib/store-i18n'

export default function CheckoutPage() {
  const router = useRouter()
  const { locale, t } = useStoreLanguage()
  const { items, clearCart } = useCartStore()
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    phone2: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 7
  const total = subtotal + deliveryFee

  useEffect(() => {
    let cancelled = false
    async function loadGovernorates() {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('id', { ascending: true })
      if (cancelled) return
      if (error) {
        console.error('[checkout] governorates:', error.message)
        toast.error(t('checkout.err.govLoad'))
        setGovernorates([])
        return
      }
      const rows = (data as Governorate[]) || []
      setGovernorates(rows)
      if (rows.length > 0 && rows.length < 24) {
        console.warn('[checkout] governorates:', rows.length, 'rows (expected 24 — run supabase/schema.sql inserts)')
      }
    }
    loadGovernorates()
    return () => {
      cancelled = true
    }
  }, [t])

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-20 h-20 text-[var(--border-card)] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('checkout.emptyTitle')}</h2>
        <p className="text-subtle mb-6">{t('checkout.emptySub')}</p>
        <Link href="/products" className="btn-primary">
          {t('checkout.discover')}
        </Link>
      </div>
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = t('checkout.err.name')
    if (!form.phone.trim()) newErrors.phone = t('checkout.err.phone')
    else if (!/^[0-9]{8}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = t('checkout.err.phoneFmt')
    if (!selectedGov) newErrors.governorate = t('checkout.err.gov')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error(t('checkout.err.fix'))
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
          customer_phone2: form.phone2 ? `+216${form.phone2.trim()}` : null,
          governorate_id: selectedGov!.id,
          governorate_name: selectedGov!.name_fr,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          total_amount: total,
          delivery_fee: deliveryFee,
          payment_method: 'cash_on_delivery',
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      router.push(`/order-confirmation/${order.id}`)
    } catch (error: any) {
      console.error(error)
      toast.error(t('checkout.err.order'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6 flex-wrap">
        <Link href="/" className="hover:text-[var(--cyan)] transition-colors">
          {t('breadcrumb.home')}
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-[var(--cyan)] transition-colors">
          {t('checkout.breadcrumbCart')}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">{t('checkout.breadcrumbCheckout')}</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer info */}
            <div className="card p-6 border border-[var(--border-card)]">
              <h2 className="font-bold text-[var(--text-primary)] text-lg mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--cyan)]" />
                {t('checkout.customerTitle')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {t('checkout.fullName')} <span className="text-[var(--cyan)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t('checkout.placeholder.name')}
                    className={`input-field ${errors.name ? 'border-red-400 focus:border-red-400' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      {t('checkout.phone')} <span className="text-[var(--cyan)]">*</span>
                    </label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-[#0A1220] border border-r-0 border-[var(--border-card)] rounded-l-xl text-sm text-[var(--text-secondary)] font-medium">
                        +216
                      </span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                        placeholder={t('checkout.placeholder.phone')}
                        className={`flex-1 px-3 py-3 bg-[var(--bg-input)] border border-l-0 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]/30 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] ${
                          errors.phone ? 'border-red-400' : 'border-[var(--border-card)]'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      {t('checkout.phone2')}{' '}
                      <span className="text-[var(--text-secondary)]/80 font-normal">{t('checkout.optional')}</span>
                    </label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-[#0A1220] border border-r-0 border-[var(--border-card)] rounded-l-xl text-sm text-[var(--text-secondary)] font-medium">
                        +216
                      </span>
                      <input
                        type="tel"
                        value={form.phone2}
                        onChange={e => setForm({ ...form, phone2: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                        placeholder={t('checkout.placeholder.phone2')}
                        className="flex-1 px-3 py-3 bg-[var(--bg-input)] border border-l-0 border-[var(--border-card)] rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]/30 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {t('checkout.address')}{' '}
                    <span className="text-[var(--text-secondary)]/80 font-normal">{t('checkout.optional')}</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder={t('checkout.placeholder.address')}
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder={t('checkout.placeholder.notes')}
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Governorate carousel */}
            <div className="card p-6 border border-[var(--border-card)]">
              <h2 className="font-bold text-[var(--text-primary)] text-lg mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--cyan)]" />
                {t('checkout.govTitle')} <span className="text-[var(--cyan)]">*</span>
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{t('checkout.govHint')}</p>
              {errors.governorate && (
                <p className="text-red-500 text-sm mb-3">{errors.governorate}</p>
              )}
              <GovernorateCarousel
                governorates={governorates}
                selected={selectedGov}
                onSelect={setSelectedGov}
              />
            </div>

            {/* Payment */}
            <div className="card p-6 border border-[var(--border-card)]">
              <h2 className="font-bold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[var(--cyan)]" />
                {t('checkout.payTitle')}
              </h2>
              <div className="flex items-center gap-4 p-4 bg-[#0A1220] border-2 border-[var(--cyan)]/30 rounded-xl">
                <div className="w-12 h-12 bg-[var(--cyan)]/15 rounded-xl flex items-center justify-center text-2xl">💵</div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{t('checkout.codTitle')}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{t('checkout.codDesc')}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-[var(--cyan)] ms-auto shrink-0" />
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-32 border border-[var(--border-card)]">
              <h2 className="font-bold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--cyan)]" />
                {t('checkout.summary')}
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-[#060C18] rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-card)]">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={productDisplayName(item.product, locale)}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
                        {productDisplayName(item.product, locale)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[var(--text-secondary)]">×{item.quantity}</span>
                        <span className="text-xs font-bold text-[var(--cyan)]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border-card)] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    {t('cart.shipping')}
                  </span>
                  <span className={deliveryFee === 0 ? 'text-[var(--cyan)] font-semibold' : 'text-[var(--text-primary)]'}>
                    {deliveryFee === 0 ? t('cart.gratis') : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('cart.freeShippingHint', { amount: formatPrice(500 - subtotal) })}
                  </p>
                )}
                <div className="flex justify-between font-bold text-base border-t border-[var(--border-card)] pt-2">
                  <span className="text-[var(--text-primary)]">{t('checkout.totalTtc')}</span>
                  <span className="text-[var(--cyan)] text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('checkout.confirm')}
                  </>
                )}
              </button>

              <p className="text-xs text-[var(--text-secondary)] text-center mt-3">
                {t('checkout.secureFooter')}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
