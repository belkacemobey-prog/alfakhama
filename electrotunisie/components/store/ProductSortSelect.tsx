'use client'

import { useRouter } from 'next/navigation'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'

const OPTION_VALUES = ['newest', 'price_asc', 'price_desc', 'rating'] as const

export default function ProductSortSelect({
  value,
  hrefBySort,
}: {
  value: string
  hrefBySort: Record<string, string>
}) {
  const router = useRouter()
  const { t } = useStoreLanguage()
  const v = OPTION_VALUES.includes(value as (typeof OPTION_VALUES)[number]) ? value : 'newest'

  const labelByValue: Record<string, string> = {
    newest: t('sort.newest'),
    price_asc: t('sort.priceAsc'),
    price_desc: t('sort.priceDesc'),
    rating: t('sort.rating'),
  }

  return (
    <select
      className="text-sm border border-[var(--border-card)] rounded-lg px-3 py-1.5 bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]/30 focus:border-[var(--cyan)]"
      value={v}
      onChange={e => {
        const href = hrefBySort[e.target.value] ?? hrefBySort.newest
        router.push(href)
      }}
    >
      {OPTION_VALUES.map(val => (
        <option key={val} value={val}>
          {labelByValue[val]}
        </option>
      ))}
    </select>
  )
}
