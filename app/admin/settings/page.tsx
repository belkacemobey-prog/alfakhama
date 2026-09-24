'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Save,
  Loader2,
  Store,
  Phone,
  MapPin,
  MessageCircle,
  Truck,
  DollarSign,
  Key,
  BarChart2,
  Globe,
} from 'lucide-react'
import {
  INTEGRATION_SETTING_KEYS,
  DELIVERY_SETTING_KEYS,
  SECRET_SETTING_PLACEHOLDER,
  STORE_SETTING_KEYS,
  isSecretPlaceholder,
  sanitizeDomainVerificationContent,
} from '@/lib/site-settings'

const STORE_FIELDS = [
  { key: 'store_name', label: 'Nom du magasin', icon: Store, placeholder: 'AL FAKHAMA STORE' },
  { key: 'store_phone', label: 'Téléphone', icon: Phone, placeholder: '+21671000000' },
  { key: 'store_address', label: 'Adresse', icon: MapPin, placeholder: 'Tunis, Tunisie' },
  { key: 'whatsapp_number', label: 'Numéro WhatsApp', icon: MessageCircle, placeholder: '+21698000000' },
  { key: 'delivery_fee', label: 'Frais de livraison (DT)', icon: Truck, placeholder: '7.000' },
  { key: 'free_delivery_threshold', label: 'Seuil livraison gratuite (DT)', icon: DollarSign, placeholder: '500' },
] as const

const INTEGRATION_FIELDS = [
  {
    key: 'facebook_pixel_id',
    label: 'ID Pixel',
    icon: BarChart2,
    placeholder: '978751128199622',
    type: 'text',
    hint: 'ID du Meta Pixel (Events Manager)',
  },
  {
    key: 'meta_capi_access_token',
    label: 'Clé API de conversion',
    icon: Key,
    placeholder: SECRET_SETTING_PLACEHOLDER,
    type: 'password',
    hint: 'Access token Meta Conversions API — laisser tel quel pour ne pas modifier',
    secret: true,
  },
  {
    key: 'meta_test_event_code',
    label: 'Code Test Events (Meta)',
    icon: BarChart2,
    placeholder: 'TEST12345',
    type: 'text',
    hint: 'Events Manager → Test events → code TEST… (temporaire, pour voir les événements)',
  },
  {
    key: 'domain_verification_content',
    label: 'Vérification de domaine',
    icon: Globe,
    placeholder: 'abc123xyz...',
    type: 'text',
    hint: 'Uniquement le code content=… — domaine en production (pas localhost)',
  },
] as const

const DELIVERY_FIELDS = [
  {
    key: 'bestway_login',
    label: 'BestWay — Login',
    icon: Truck,
    placeholder: 'votre login',
    type: 'text',
    hint: 'Identifiant API BestWay Delivery',
  },
  {
    key: 'bestway_password',
    label: 'BestWay — Mot de passe',
    icon: Key,
    placeholder: SECRET_SETTING_PLACEHOLDER,
    type: 'password',
    hint: 'Mot de passe API — laisser tel quel pour ne pas modifier',
    secret: true,
  },
  {
    key: 'bestway_modalite',
    label: 'BestWay — Modalité paiement',
    icon: DollarSign,
    placeholder: '2',
    type: 'text',
    hint: '0 = Chèque, 2 = Espèce (COD), 3 = Aucune préférence',
  },
] as const

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [secretFieldsSet, setSecretFieldsSet] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) {
        toast.error('Erreur de chargement des paramètres')
        setLoading(false)
        return
      }

      const map: Record<string, string> = {}
      const secrets: Record<string, boolean> = {}
      data?.forEach((row: { key: string; value: string | null }) => {
        map[row.key] = row.value || ''
        if (
          (row.key === 'meta_capi_access_token' || row.key === 'bestway_password') &&
          row.value
        ) {
          map[row.key] = SECRET_SETTING_PLACEHOLDER
          secrets[row.key] = true
        }
      })
      setSettings(map)
      setSecretFieldsSet(secrets)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load settings once on mount
  }, [])

  const handleSave = async () => {
    setSaving(true)

    const allKeys = [...STORE_SETTING_KEYS, ...INTEGRATION_SETTING_KEYS, ...DELIVERY_SETTING_KEYS]
    const updates = allKeys
      .filter(key => {
        const value = settings[key] ?? ''
        if (secretFieldsSet[key] && isSecretPlaceholder(value)) return false
        return true
      })
      .map(key => {
        let value = settings[key] ?? ''
        if (key === 'domain_verification_content') {
          value = sanitizeDomainVerificationContent(value)
        }
        return {
          key,
          value,
          updated_at: new Date().toISOString(),
        }
      })

    const { error } = await supabase.from('settings').upsert(updates)
    if (error) {
      toast.error(`Erreur de sauvegarde: ${error.message}`)
      setSaving(false)
      return
    }

    // Mark secrets as set after successful save
    if (settings.bestway_password && !isSecretPlaceholder(settings.bestway_password)) {
      setSecretFieldsSet(prev => ({ ...prev, bestway_password: true }))
      setSettings(prev => ({ ...prev, bestway_password: SECRET_SETTING_PLACEHOLDER }))
    }

    // Keep local state cleaned
    setSettings(prev => ({
      ...prev,
      domain_verification_content: sanitizeDomainVerificationContent(
        prev.domain_verification_content
      ),
    }))

    toast.success('Paramètres sauvegardés !')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
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
        {STORE_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
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

      <div className="card p-6 space-y-5">
        <div>
          <h2 className="font-bold text-secondary">Intégrations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Meta Pixel, Conversions API et vérification de domaine. Les changements s&apos;appliquent
            après sauvegarde.
          </p>
        </div>

        {INTEGRATION_FIELDS.map(field => {
          const { key, label, icon: Icon, placeholder, type, hint } = field
          const secret = 'secret' in field && Boolean(field.secret)
          return (
            <div key={key}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </label>
              <input
                type={type}
                value={settings[key] || ''}
                onChange={e => {
                  const value = e.target.value
                  setSettings(prev => ({ ...prev, [key]: value }))
                  if (secret) setSecretFieldsSet(prev => ({ ...prev, [key]: false }))
                }}
                placeholder={placeholder}
                className="input-field font-mono text-sm"
                autoComplete="off"
              />
              {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
            </div>
          )
        })}
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <h2 className="font-bold text-secondary">Livraison — BestWay</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quand vous confirmez une commande avec BestWay, le colis est créé via l&apos;API et le
            statut passe automatiquement à <strong>Téléchargé</strong>.
          </p>
        </div>
        {DELIVERY_FIELDS.map(field => {
          const { key, label, icon: Icon, placeholder, type, hint } = field
          const secret = 'secret' in field && Boolean(field.secret)
          return (
            <div key={key}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </label>
              <input
                type={type}
                value={settings[key] || ''}
                onChange={e => {
                  const value = e.target.value
                  setSettings(prev => ({ ...prev, [key]: value }))
                  if (secret) setSecretFieldsSet(prev => ({ ...prev, [key]: false }))
                }}
                placeholder={placeholder}
                className="input-field font-mono text-sm"
                autoComplete="off"
              />
              {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 space-y-2">
        <p className="font-semibold">Vérification de domaine Meta — important</p>
        <p className="text-red-700 font-medium">
          Meta ne peut PAS vérifier localhost. Il faut un site en ligne (Vercel / domaine).
        </p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800/90">
          <li>
            Collez ici uniquement le code (ex. <code className="text-xs bg-white/60 px-1 rounded">a1b2c3…</code>),
            pas la balise HTML complète.
          </li>
          <li>
            Ou mettez-le dans <code className="text-xs bg-white/60 px-1 rounded">.env</code> :{' '}
            <code className="text-xs bg-white/60 px-1 rounded">NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=code</code>
          </li>
          <li>Déployez, puis ouvrez <code className="text-xs bg-white/60 px-1 rounded">/api/meta-domain-status</code> sur le domaine live.</li>
          <li>
            Sur la page d&apos;accueil live → code source → cherchez{' '}
            <code className="text-xs bg-white/60 px-1 rounded">facebook-domain-verification</code>.
          </li>
          <li>
            Si la balise meta échoue encore : dans Meta choisissez <strong>DNS</strong> et ajoutez un enregistrement TXT :
            <code className="block text-xs mt-1 bg-white/60 px-2 py-1 rounded break-all">
              facebook-domain-verification=VOTRE_CODE
            </code>
          </li>
        </ol>
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
