'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', name_ar: '', icon: '', slug: '' })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount
  }, [])

  const handleSave = async () => {
    if (!form.name) { toast.error('Nom requis'); return }
    setSaving(true)
    const data = { ...form, slug: form.slug || slugify(form.name) }
    if (editingId) {
      const { error } = await supabase.from('categories').update(data).eq('id', editingId)
      if (error) toast.error('Erreur')
      else toast.success('Catégorie mise à jour')
    } else {
      const { error } = await supabase.from('categories').insert({ ...data, is_active: true })
      if (error) toast.error(error.message)
      else toast.success('Catégorie créée')
    }
    setForm({ name: '', name_ar: '', icon: '', slug: '' })
    setShowForm(false)
    setEditingId(null)
    await load()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Supprimé')
    load()
  }

  const handleEdit = (cat: any) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, name_ar: cat.name_ar || '', icon: cat.icon || '', slug: cat.slug })
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary">Catégories</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', name_ar: '', icon: '', slug: '' }) }} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-secondary">{editingId ? 'Modifier' : 'Nouvelle'} catégorie</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nom (FR) *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value, slug: slugify(e.target.value)}))} className="input-field" placeholder="Réfrigérateurs" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nom (AR)</label>
              <input type="text" value={form.name_ar} onChange={e => setForm(f => ({...f, name_ar: e.target.value}))} dir="rtl" className="input-field" placeholder="ثلاجات" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Icône (emoji)</label>
              <input type="text" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} className="input-field" placeholder="🌡️" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className="input-field" />
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
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Icône', 'Nom', 'Slug', 'Statut', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chargement...</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-2xl">{cat.icon || '📦'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400" dir="rtl">{cat.name_ar}</p>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
