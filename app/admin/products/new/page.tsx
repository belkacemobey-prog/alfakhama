export const dynamic = 'force-dynamic'

import ProductForm from '@/components/admin/ProductForm'
import { AdminProductEditorTitle } from '@/components/admin/AdminPageTitle'

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <AdminProductEditorTitle mode="new" />
      <ProductForm />
    </div>
  )
}
