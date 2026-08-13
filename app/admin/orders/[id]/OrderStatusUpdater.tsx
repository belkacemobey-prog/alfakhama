'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ORDER_STATUSES } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (error) {
      toast.error('Erreur de mise à jour')
    } else {
      toast.success('Statut mis à jour !')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {Object.entries(ORDER_STATUSES).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Mettre à jour
      </button>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUSES[currentStatus as keyof typeof ORDER_STATUSES]?.color}`}>
        Actuel: {ORDER_STATUSES[currentStatus as keyof typeof ORDER_STATUSES]?.label}
      </span>
    </div>
  )
}
