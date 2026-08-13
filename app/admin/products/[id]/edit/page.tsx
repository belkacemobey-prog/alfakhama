export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import ProductForm from '@/components/admin/ProductForm'
import { AdminProductEditorTitle } from '@/components/admin/AdminPageTitle'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single()
  if (!product) notFound()

  return (
    <div className="space-y-5">
      <AdminProductEditorTitle mode="edit" productName={product.name} />
      <ProductForm product={product} isEdit />
    </div>
  )
}
