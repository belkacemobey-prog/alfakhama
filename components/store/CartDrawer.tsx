'use client'

import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import { productDisplayName } from '@/lib/store-i18n'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, itemCount } = useCartStore()
  const { locale, t } = useStoreLanguage()

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 7
  const total = subtotal + deliveryFee

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--bg-page)] border-l border-[var(--border-card)] z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--cyan)]" />
                <h2 className="font-bold text-lg text-[var(--text-primary)]">{t('cart.title')}</h2>
                {itemCount > 0 && (
                  <span className="bg-[var(--cyan)] text-[var(--text-on-badge)] text-xs font-bold min-w-[24px] h-6 px-1 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 hover:bg-[var(--bg-card)] rounded-xl text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-[var(--border-card)] mb-4" />
                  <p className="text-[var(--text-secondary)] font-medium">{t('cart.empty')}</p>
                  <p className="text-subtle text-sm mt-1">{t('cart.emptyHint')}</p>
                  <Link href="/products" onClick={closeCart} className="mt-4 btn-primary text-sm">
                    {t('cart.ctaBrowse')}
                  </Link>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.product.id}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-3"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-[#060C18] rounded-lg overflow-hidden border border-[var(--border-card)]">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={productDisplayName(item.product, locale)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-[var(--text-secondary)]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 leading-tight">
                        {productDisplayName(item.product, locale)}
                      </p>
                      <p className="text-[var(--cyan)] font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--cyan)] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--cyan)] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1 hover:text-[var(--cyan)] text-[var(--text-secondary)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--border-card)] px-4 py-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t('cart.subtotal')}</span>
                    <span className="text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t('cart.shipping')}</span>
                    <span className={deliveryFee === 0 ? 'text-[var(--cyan)] font-semibold' : 'text-[var(--text-primary)]'}>
                      {deliveryFee === 0 ? t('cart.gratis') : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t('cart.freeShippingHint', { amount: formatPrice(500 - subtotal) })}
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border-card)]">
                    <span className="text-[var(--text-primary)]">{t('cart.total')}</span>
                    <span className="text-[var(--cyan)]">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full text-center text-base py-3 block"
                >
                  {t('cart.checkout')}
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--cyan)] transition-colors py-1"
                >
                  {t('cart.continue')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
