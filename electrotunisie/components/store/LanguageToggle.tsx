'use client'

import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import type { StoreLocale } from '@/lib/store-i18n'

const btn =
  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-[var(--border-card)]'

export default function LanguageToggle() {
  const { locale, setLocale, t } = useStoreLanguage()

  const set = (next: StoreLocale) => {
    setLocale(next)
  }

  return (
    <div
      className="flex items-center rounded-[10px] border border-[var(--border-card)] bg-[var(--bg-input)] p-0.5"
      role="group"
      aria-label={locale === 'ar' ? 'تبديل اللغة' : 'Changer la langue'}
    >
      <button
        type="button"
        onClick={() => set('fr')}
        className={`${btn} ${
          locale === 'fr'
            ? 'bg-[var(--cyan)] text-[var(--text-on-badge)] border-transparent'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
        }`}
      >
        {t('lang.switchFr')}
      </button>
      <button
        type="button"
        onClick={() => set('ar')}
        className={`${btn} ${
          locale === 'ar'
            ? 'bg-[var(--cyan)] text-[var(--text-on-badge)] border-transparent'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
        }`}
        dir="rtl"
      >
        {t('lang.switchAr')}
      </button>
    </div>
  )
}
