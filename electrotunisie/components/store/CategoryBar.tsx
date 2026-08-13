'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function CategoryBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  const handleClick = (categoryName: string) => {
    if (activeCategory === categoryName) {
      router.push('/products')
    } else {
      router.push(`/products?category=${encodeURIComponent(categoryName)}`)
    }
  }

  return (
    <div className="bg-[var(--bg-card)] border-b border-[var(--border-card)] sticky top-[92px] z-40 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide no-scrollbar">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => router.push('/products')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-[var(--cyan)] text-[var(--text-on-badge)] shadow-sm'
                : 'bg-[#0A1220] text-[var(--text-secondary)] border border-[var(--border-card)] hover:border-[var(--cyan)] hover:text-[var(--text-primary)]'
            }`}
          >
            Tout
          </motion.button>

          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.slug}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleClick(cat.name)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.name
                  ? 'bg-[var(--cyan)] text-[var(--text-on-badge)] shadow-sm'
                  : 'bg-[#0A1220] text-[var(--text-secondary)] border border-[var(--border-card)] hover:border-[var(--cyan)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
