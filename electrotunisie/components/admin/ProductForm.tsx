'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CATEGORIES, BRANDS } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, X, Upload, Star, Eye, FolderUp } from 'lucide-react'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

interface ProductFormProps {
  product?: Record<string, unknown>
  isEdit?: boolean
}

export default function ProductForm({ product, isEdit }: ProductFormProps) {
  const router = useRouter()
  const { t } = useAdminLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState<string[]>((product?.images as string[]) || [])
  const [imageUrl, setImageUrl] = useState('')
  const [form, setForm] = useState({
    name: String(product?.name ?? ''),
    name_ar: String(product?.name_ar ?? ''),
    description: String(product?.description ?? ''),
    description_ar: String(product?.description_ar ?? ''),
    price: product?.price != null ? String(product.price) : '',
    original_price: product?.original_price != null ? String(product.original_price) : '',
    category: String(product?.category ?? CATEGORIES[0].name),
    brand: String(product?.brand ?? ''),
    stock: product?.stock != null ? Number(product.stock) : 0,
    is_featured: Boolean(product?.is_featured ?? false),
    is_active: Boolean(product?.is_active ?? true),
  })

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages(prev => [...prev, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function appendUploadedFiles(files: FileList | null) {
    if (!files?.length) return

    const list = Array.from(files).filter(Boolean)

    for (const file of list) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('form.image.invalidType'))
        continue
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(t('form.image.tooLarge'))
        continue
      }
    }

    const valid = list.filter(f => f.type.startsWith('image/') && f.size <= MAX_UPLOAD_BYTES)
    if (valid.length === 0) return

    setUploadingImages(true)
    try {
      for (const file of valid) {
        const body = new FormData()
        body.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body,
        })

        const data = (await res.json().catch(() => ({}))) as {
          publicUrl?: string
          error?: string
          hint?: string
        }

        if (!res.ok || !data.publicUrl) {
          console.error('[upload]', res.status, data)
          const detail = [data.error, data.hint].filter(Boolean).join(' — ')
          toast.error(detail ? `${t('form.image.uploadFail')}: ${detail}` : t('form.image.uploadFail'))
          continue
        }

        setImages(prev => [...prev, data.publicUrl!])
      }
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error(t('form.requiredNamePrice'))
      return
    }
    setLoading(true)
    const supabase = createClient()
    const brandTrimmed = typeof form.brand === 'string' ? form.brand.trim() : ''
    const data = {
      ...form,
      brand: brandTrimmed === '' ? null : brandTrimmed,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(String(form.stock), 10),
      images,
    }

    if (isEdit && product?.id != null) {
      const { error } = await supabase
        .from('products')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', product.id as string)
      if (error) {
        toast.error(t('form.errUpdate'))
        setLoading(false)
        return
      }
      toast.success(t('form.successEdit'))
    } else {
      const { error } = await supabase.from('products').insert(data)
      if (error) {
        toast.error(t('form.errCreate'))
        setLoading(false)
        return
      }
      toast.success(t('form.successCreate'))
    }
    router.push('/admin/products')
    router.refresh()
  }

  const uploadDisabled = loading || uploadingImages

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-secondary">{t('form.base')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.nameFr')}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="input-field"
              placeholder={t('form.nameFrPh')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.nameAr')}</label>
            <input
              type="text"
              value={form.name_ar}
              onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
              dir="rtl"
              className="input-field"
              placeholder={t('form.nameArPh')}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.descFr')}</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.descAr')}</label>
          <textarea
            value={form.description_ar}
            onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
            rows={3}
            dir="rtl"
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-secondary mb-4">{t('form.catBrand')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.cat')}</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field"
            >
              {CATEGORIES.map(c => (
                <option key={c.slug} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.brand')}</label>
            <input
              type="text"
              list="admin-product-brand-suggestions"
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              className="input-field"
              placeholder={t('form.brandPh')}
              autoComplete="off"
            />
            <datalist id="admin-product-brand-suggestions">
              {BRANDS.map(b => (
                <option key={b} value={b} />
              ))}
            </datalist>
            <p className="text-xs text-gray-500 mt-1">{t('form.brandHint')}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-secondary mb-4">{t('form.pricing')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.price')}</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required
              className="input-field"
              placeholder="1890.000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.priceOriginal')}</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.original_price}
              onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
              className="input-field"
              placeholder="2100.000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form.stock')}</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-secondary mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          {t('form.images')}
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={e => appendUploadedFiles(e.target.files)}
        />
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder={t('form.imageUrlPh')}
            className="input-field flex-1 text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddImage()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
          >
            {t('form.addUrl')}
          </button>
          <button
            type="button"
            disabled={uploadDisabled}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderUp className="w-4 h-4 text-primary" />}
            {uploadingImages ? t('form.uploading') : t('form.uploadDevice')}
          </button>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={`${img}-${idx}`} className="relative group">
                <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-gray-50" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X className="w-3 h-3" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] leading-tight bg-primary text-primary-foreground px-1 rounded">
                    {t('form.mainImage')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-secondary mb-4">{t('form.options')}</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.is_featured ? 'bg-primary' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={form.is_featured}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  form.is_featured ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              {t('form.featured')}
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.is_active ? 'bg-green-500' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={form.is_active}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Eye className="w-4 h-4 text-green-500" />
              {t('form.visible')}
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isEdit ? t('form.saveEdit') : t('form.saveCreate')}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          {t('form.cancel')}
        </button>
      </div>
    </form>
  )
}
