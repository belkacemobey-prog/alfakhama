'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Order, OrderItem } from '@/lib/supabase'
import { formatPrice, ORDER_STATUSES } from '@/lib/utils'
import { formatSelectedOptions } from '@/lib/product-options'
import { CheckCircle, Package, Truck, MapPin, Phone, MessageCircle, Printer, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fbq } from '@/lib/fbq'
import { DEFAULT_WHATSAPP, waMeUrl } from '@/lib/phone'

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseTracked, setPurchaseTracked] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP)
  const [storeName, setStoreName] = useState('AL FAKHAMA STORE')

  useEffect(() => {
    async function load() {
      const { data: o } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()
      if (o) {
        setOrder(o as Order)
        const { data: i } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', o.id)
        setItems((i as OrderItem[]) || [])
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(data => {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
        if (data.store_name) setStoreName(data.store_name)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!order || purchaseTracked) return
    fbq('track', 'Purchase', {
      value: order.total_amount,
      currency: 'TND',
    })
    setPurchaseTracked(true)
  }, [order, purchaseTracked])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 skeleton rounded-full mx-auto mb-4" />
        <div className="h-6 skeleton rounded-xl w-64 mx-auto mb-2" />
        <div className="h-4 skeleton rounded-xl w-48 mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Commande introuvable</h2>
        <Link href="/" className="text-[var(--cyan)] mt-4 inline-block hover:opacity-80 transition-opacity">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const whatsappMsg = `Bonjour ${storeName} ! Je viens de passer la commande ${order.order_number}. Pouvez-vous confirmer ?`
  const whatsappUrl = waMeUrl(whatsappNumber, whatsappMsg)

  const STATUS_STEPS = ['pending', 'confirmed', 'telecharge', 'processing', 'shipped', 'delivered']
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Success header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-2">
          Commande confirmée ! 🎉
        </h1>
        <p className="text-[var(--text-secondary)]">
          Merci <strong className="text-[var(--text-primary)]">{order.customer_name}</strong> ! Votre commande a bien été reçue.
        </p>
        <div className="inline-flex items-center gap-2 bg-[var(--cyan)]/15 text-[var(--cyan)] font-bold px-4 py-2 rounded-xl mt-3 border border-[var(--cyan)]/30">
          <Package className="w-4 h-4" />
          {order.order_number}
        </div>
      </motion.div>

      {/* Order status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6 border border-[var(--border-card)]"
      >
        <h2 className="font-bold text-[var(--text-primary)] mb-5 text-lg">Suivi de commande</h2>
        <div className="relative">
          <div className="flex items-center justify-between relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStep
              const isDone = idx < currentStep
              const status = ORDER_STATUSES[step as keyof typeof ORDER_STATUSES]
              return (
                <div key={step} className="flex flex-col items-center gap-1 relative z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                    isCurrent
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isDone
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-secondary)]'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block text-center ${isCurrent ? 'text-[var(--cyan)]' : isDone ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                    {status.label}
                  </span>
                </div>
              )
            })}
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--border-card)] -z-0">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-5 border border-[var(--border-card)]"
        >
          <h2 className="font-bold text-[var(--text-primary)] mb-4 text-lg">Détails de livraison</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[var(--cyan)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Téléphone</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{order.customer_phone}</p>
                {order.customer_phone2 && (
                  <p className="text-sm text-[var(--text-secondary)]">{order.customer_phone2}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[var(--cyan)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Gouvernorat</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{order.governorate_name}</p>
                {order.address && <p className="text-sm text-[var(--text-secondary)]">{order.address}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-[var(--cyan)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Livraison</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {order.delivery_fee === 0 ? '🎉 Livraison gratuite' : formatPrice(order.delivery_fee)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5">💵</span>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Paiement</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Paiement à la livraison</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-5 border border-[var(--border-card)]"
        >
          <h2 className="font-bold text-[var(--text-primary)] mb-4 text-lg">Articles commandés</h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-[#060C18] border border-[var(--border-card)]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-1">{item.product_name}</p>
                  {formatSelectedOptions(item.selected_options) ? (
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      {formatSelectedOptions(item.selected_options)}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-[var(--text-secondary)]">×{item.quantity}</span>
                    <span className="text-xs font-bold text-[var(--cyan)]">{formatPrice(item.total_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border-card)] mt-3 pt-3 flex justify-between font-bold">
            <span className="text-sm text-[var(--text-primary)]">Total</span>
            <span className="text-[var(--cyan)]">{formatPrice(order.total_amount)}</span>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#20BA5C] transition-colors"
        >
          <MessageCircle className="w-5 h-5 fill-white stroke-none" />
          Contacter via WhatsApp
        </a>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 btn-outline"
        >
          <Printer className="w-4 h-4" />
          Imprimer le reçu
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-bold px-6 py-3 rounded-xl hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
        >
          <Home className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
      </motion.div>
    </div>
  )
}
