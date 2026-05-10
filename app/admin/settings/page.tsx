'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, Loader2, Store, Phone, MapPin, MessageCircle, Truck, DollarSign } from 'lucide-react'

const SETTING_KEYS = [
  { key: 'store_name', label: 'Nom du magasin', icon: Store, placeholder: 'ElectroTunisie' },
  { key: 'store_phone', label: 'Téléphone', icon: Phone, placeholder: '+21671000000' },
  { key: 'store_address', label: 'Adresse', icon: MapPin, placeholder: 'Tunis, Tunisie' },
  { key: 'whatsapp_number', label: 'Numéro WhatsApp', icon: MessageCircle, placeholder: '+21698000000' },
  { key: 'delivery_fee', label: 'Frais de livraison (DT)', icon: Truck, placeholder: '7.000' },
  { key: 'free_delivery_threshold', label: 'Seuil livraison gratuite (DT)', icon: DollarSign, placeholder: '500' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {}
      data?.forEach(s => { map[s.key] = s.value || '' })
      setSettings(map)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('settings').upsert(updates)
    if (error) toast.error('Erreur de sauvegarde')
    else toast.success('Paramètres sauvegardés !')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 skeleton rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary">Paramètres</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-bold text-secondary">Informations du magasin</h2>
        {SETTING_KEYS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </label>
            <input
              type="text"
              value={settings[key] || ''}
              onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="input-field"
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">💡 Info</p>
        <p>Les paramètres de livraison s'appliquent automatiquement à toutes les nouvelles commandes.</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2 w-full justify-center py-3.5 text-base"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Sauvegarder tous les paramètres
      </button>
    </div>
  )
}
