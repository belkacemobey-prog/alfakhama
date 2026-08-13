'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

export function AdminProductEditorTitle({
  mode,
  productName,
}: {
  mode: 'new' | 'edit'
  productName?: string
}) {
  const { t } = useAdminLanguage()

  const title =
    mode === 'new' ? t('products.page.newTitle') : t('products.page.editTitle', { name: productName || '—' })

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <h1 className="text-xl font-bold text-secondary">{title}</h1>
    </div>
  )
}
