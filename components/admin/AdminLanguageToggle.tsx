'use client'

import { type AdminLocale } from '@/lib/admin-i18n'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

export default function AdminLanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useAdminLanguage()

  const seg = (l: AdminLocale, labelKey: string) => (
    <button
      type="button"
      onClick={() => setLocale(l)}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
        locale === l
          ? 'bg-secondary text-white shadow-sm'
          : 'text-secondary hover:bg-gray-50'
      }`}
    >
      {t(labelKey)}
    </button>
  )

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-lg border border-gray-200 bg-white p-0.5 ${className}`}
    >
      {seg('fr', 'lang.fr')}
      {seg('ar', 'lang.ar')}
    </div>
  )
}
