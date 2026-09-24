'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Check, Eye, EyeOff, Loader2, Image as ImageIcon } from 'lucide-react'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', sort_order: 0, is_active: true })

  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('banners').select('*').order('sort_order')
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount
  }, [])

  const handleSave = async () => {
    if (!form.image) { toast.error('Image requise'); return }
    setSaving(true)
    if (editingId) {
      const { error } = await supabase.from('banners').update(form).eq('id', editingId)
      if (error) toast.error('Erreur')
      else toast.success('Bannière mise à jour')
    } else {
      const { error } = await supabase.from('banners').insert(form)
      if (error) toast.error('Erreur')
      else toast.success('Bannière créée')
    }
    setForm({ title: '', subtitle: '', image: '', link: '', sort_order: 0, is_active: true })
    setShowForm(false); setEditingId(null)
    await load()
    setSaving(false)
  }

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from('banners').update({ is_active: !active }).eq('id', id)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette bannière ?')) return
    await supabase.from('banners').delete().eq('id', id)
    toast.success('Supprimé'); load()
  }

  const handleEdit = (banner: any) => {
    setEditingId(banner.id)
    setForm({ title: banner.title || '', subtitle: banner.subtitle || '', image: banner.image || '', link: banner.link || '', sort_order: banner.sort_order, is_active: banner.is_active })
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary">Bannières Hero</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', subtitle: '', image: '', link: '', sort_order: banners.length, is_active: true }) }} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle bannière
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-secondary">{editingId ? 'Modifier' : 'Nouvelle'} bannière</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Titre</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" placeholder="Soldes d'Été 2024" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sous-titre</label>
              <input type="text" value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} className="input-field" placeholder="Jusqu'à -30% sur..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">URL Image *</label>
              <input type="url" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} className="input-field" placeholder="https://..." />
              {form.image && <img src={form.image} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" />}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Lien</label>
              <input type="text" value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="input-field" placeholder="/products?category=..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ordre</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({...f, sort_order: parseInt(e.target.value)}))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Enregistrer
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2">Annuler</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-gray-400">Chargement...</div>
        ) : banners.length === 0 ? (
          <div className="card p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden />
            <p className="text-gray-500">Aucune bannière. Créez la première !</p>
          </div>
        ) : banners.map(banner => (
          <div key={banner.id} className={`card p-4 flex items-center gap-4 ${!banner.is_active ? 'opacity-60' : ''}`}>
            <div className="w-24 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {banner.image && <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{banner.title || 'Sans titre'}</p>
              <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
              <p className="text-xs text-gray-400">Ordre: {banner.sort_order} · {banner.link}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleToggle(banner.id, banner.is_active)} className={`p-1.5 rounded-lg transition-colors ${banner.is_active ? 'hover:bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => handleEdit(banner)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(banner.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
