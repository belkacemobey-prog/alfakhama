'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ORDER_STATUSES } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CARRIERS = [
  { id: '', label: 'Aucune (statut seul)' },
  { id: 'bestway', label: 'BestWay Delivery' },
] as const

function hasBestwayInNotes(notes?: string | null) {
  return Boolean(notes && /BestWay barcode:/i.test(notes))
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  deliveryBarcode,
  deliveryCarrier,
  orderNotes,
}: {
  orderId: string
  currentStatus: string
  deliveryBarcode?: string | null
  deliveryCarrier?: string | null
  orderNotes?: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [carrier, setCarrier] = useState(deliveryCarrier || (currentStatus === 'confirmed' ? 'bestway' : ''))
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const barcodeFromNotes = orderNotes?.match(/BestWay barcode:\s*(\S+)/i)?.[1] || null
  const effectiveBarcode = deliveryBarcode || barcodeFromNotes
  const isLocked =
    currentStatus === 'telecharge' || Boolean(deliveryBarcode) || hasBestwayInNotes(orderNotes)

  const handleUpdate = async () => {
    if (isLocked) {
      toast.error('Statut verrouillé : le colis est déjà téléchargé.')
      return
    }

    setLoading(true)
    try {
      // Confirmé + BestWay → envoi API puis statut Téléchargé (bleu), puis verrouillé
      if (status === 'confirmed' && carrier === 'bestway') {
        const res = await fetch(`/api/admin/orders/${orderId}/bestway`, { method: 'POST' })
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          barcode?: string
          status?: string
          warning?: string
        }
        if (!res.ok) {
          toast.error(body.error || 'Échec envoi BestWay')
          setLoading(false)
          return
        }
        toast.success(
          body.barcode
            ? `Colis téléchargé — code-barres ${body.barcode}`
            : 'Colis téléchargé vers BestWay'
        )
        if (body.warning) toast.message(body.warning)
        setStatus('telecharge')
        router.refresh()
        setLoading(false)
        return
      }

      if (status === 'confirmed' && !carrier) {
        toast.error('Choisissez une société de livraison (BestWay).')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          delivery_carrier: carrier || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
      } else {
        toast.success('Statut mis à jour !')
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const canSave =
    !isLocked &&
    (status !== currentStatus ||
      (status === 'confirmed' && carrier === 'bestway') ||
      carrier !== (deliveryCarrier || ''))

  if (isLocked) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${ORDER_STATUSES.telecharge.color}`}
          >
            {ORDER_STATUSES.telecharge.icon} {ORDER_STATUSES.telecharge.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <Lock className="w-3.5 h-3.5" />
            Statut verrouillé — non modifiable
          </span>
        </div>
        {(deliveryCarrier || 'bestway') && (
          <p className="text-sm text-gray-600">
            Société : <strong className="capitalize">{deliveryCarrier || 'bestway'}</strong>
          </p>
        )}
        {effectiveBarcode ? (
          <p className="text-sm text-gray-600">
            Code-barres BestWay :{' '}
            <span className="font-mono font-semibold text-blue-700">{effectiveBarcode}</span>
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={e => {
            const next = e.target.value
            setStatus(next)
            if (next === 'confirmed' && !carrier) setCarrier('bestway')
          }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {Object.entries(ORDER_STATUSES)
            .filter(([k]) => k !== 'telecharge')
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>

        {status === 'confirmed' && (
          <select
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[200px]"
          >
            {CARRIERS.filter(c => c.id !== '').map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading || !canSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sauvegarder
        </button>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            ORDER_STATUSES[currentStatus as keyof typeof ORDER_STATUSES]?.color
          }`}
        >
          Actuel: {ORDER_STATUSES[currentStatus as keyof typeof ORDER_STATUSES]?.label}
        </span>
      </div>

    </div>
  )
}
