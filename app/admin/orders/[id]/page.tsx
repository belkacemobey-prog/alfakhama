export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/utils'
import { formatSelectedOptions } from '@/lib/product-options'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, MapPin, Phone, Package, Truck, XCircle, Settings } from 'lucide-react'
import OrderStatusUpdater from './OrderStatusUpdater'
import PrintButton from '@/components/admin/PrintButton'

async function getOrder(id: string) {
  const supabase = createClient()
  const [orderRes, itemsRes] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id),
  ])
  if (!orderRes.data) return null
  return { order: orderRes.data, items: itemsRes.data || [] }
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrder(params.id)
  if (!data) notFound()
  const { order, items } = data

  const isTelecharge =
    order.status === 'telecharge' ||
    Boolean(order.delivery_barcode) ||
    Boolean(order.notes && /BestWay barcode:/i.test(order.notes))
  const effectiveStatus = isTelecharge ? 'telecharge' : order.status

  const STATUS_STEPS = ['pending', 'confirmed', 'telecharge', 'processing', 'shipped', 'delivered']
  const currentStep = STATUS_STEPS.indexOf(effectiveStatus)
  const whatsappMsg = encodeURIComponent(`Bonjour ${order.customer_name}, votre commande ${order.order_number} est `)
  const whatsappUrl = `https://wa.me/${order.customer_phone.replace('+', '')}?text=${whatsappMsg}`

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-secondary font-mono">{order.order_number}</h1>
            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-medium rounded-xl hover:bg-[#20BA5C] transition-colors">
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            WhatsApp
          </a>
          <PrintButton className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 no-print" />
        </div>
      </div>

      {/* Status stepper */}
      {order.status !== 'cancelled' && (
        <div className="card p-5">
          <div className="flex items-center justify-between relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStep
              const isDone = idx < currentStep
              const status = ORDER_STATUSES[step as keyof typeof ORDER_STATUSES]
              return (
                <div key={step} className="flex flex-col items-center gap-1 relative z-10 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                    isCurrent && step === 'telecharge'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCurrent
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isDone
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block text-center leading-tight max-w-[70px] ${
                    isCurrent && step === 'telecharge'
                      ? 'text-blue-700 font-semibold'
                      : isCurrent
                        ? 'text-primary'
                        : isDone
                          ? 'text-green-600'
                          : 'text-gray-400'
                  }`}>
                    {status?.label}
                  </span>
                </div>
              )
            })}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(0, currentStep) / (STATUS_STEPS.length - 1) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">Commande annulée</p>
            <p className="text-sm text-red-500">Cette commande a été annulée.</p>
          </div>
        </div>
      )}

      {/* Status update */}
      <div className="card p-5">
        <h2 className="font-bold text-secondary mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Mettre à jour le statut
        </h2>
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={effectiveStatus}
          deliveryBarcode={order.delivery_barcode}
          deliveryCarrier={order.delivery_carrier}
          orderNotes={order.notes}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer info */}
        <div className="card p-5">
          <h2 className="font-bold text-secondary mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Informations client
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Nom</dt>
              <dd className="font-semibold text-gray-900">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Téléphone</dt>
              <dd className="font-semibold">{order.customer_phone}</dd>
            </div>
            {order.customer_phone2 && (
              <div>
                <dt className="text-xs text-gray-500">Téléphone 2</dt>
                <dd className="font-semibold">{order.customer_phone2}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />Gouvernorat</dt>
              <dd className="font-semibold">{order.governorate_name}</dd>
            </div>
            {order.address && (
              <div>
                <dt className="text-xs text-gray-500">Adresse</dt>
                <dd className="text-sm text-gray-700">{order.address}</dd>
              </div>
            )}
            {order.notes && (
              <div>
                <dt className="text-xs text-gray-500">Notes</dt>
                <dd className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order summary */}
        <div className="card p-5">
          <h2 className="font-bold text-secondary mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Articles ({items.length})
          </h2>
          <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
            {(items as any[]).map(item => (
              <div key={item.id} className="flex gap-3">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.product_name}</p>
                  {formatSelectedOptions(item.selected_options) ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatSelectedOptions(item.selected_options)}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{formatPrice(item.unit_price)} × {item.quantity}</span>
                    <span className="text-sm font-bold text-primary">{formatPrice(item.total_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(order.total_amount - order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Livraison</span>
              <span>{order.delivery_fee === 0 ? 'Gratuit' : formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1.5">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
