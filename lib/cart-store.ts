import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from './supabase'
import { cartLineKey } from './product-options'

export interface CartItem {
  product: Product
  quantity: number
  selectedOptions: Record<string, string>
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>,
    opts?: { openDrawer?: boolean }
  ) => void
  removeItem: (lineKey: string) => void
  updateQuantity: (lineKey: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: number
  itemCount: number
}

function lineKeyOf(item: CartItem): string {
  return cartLineKey(item.product.id, item.selectedOptions || {})
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, selectedOptions = {}, opts) => {
        const key = cartLineKey(product.id, selectedOptions)
        const items = get().items
        const existing = items.find(i => lineKeyOf(i) === key)
        if (existing) {
          set({
            items: items.map(i =>
              lineKeyOf(i) === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          set({
            items: [...items, { product, quantity, selectedOptions: { ...selectedOptions } }],
          })
        }
        if (opts?.openDrawer !== false) {
          set({ isOpen: true })
        }
      },

      removeItem: lineKey => {
        set({ items: get().items.filter(i => lineKeyOf(i) !== lineKey) })
      },

      updateQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey)
          return
        }
        set({
          items: get().items.map(i => (lineKeyOf(i) === lineKey ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'electrotunisie-cart',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<CartStore> | undefined
        const items = (p?.items || []).map(item => ({
          ...item,
          selectedOptions: item.selectedOptions || {},
        }))
        return { ...current, ...p, items }
      },
    }
  )
)
