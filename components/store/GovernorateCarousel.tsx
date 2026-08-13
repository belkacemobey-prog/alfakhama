'use client'

import { Governorate } from '@/lib/supabase'
import { Check, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'

const GOV_EMOJIS: Record<string, string> = {
  Tunis: '🏙️',
  Ariana: '🌿',
  'Ben Arous': '🏘️',
  Manouba: '🌾',
  Nabeul: '🏺',
  Zaghouan: '⛰️',
  Bizerte: '⚓',
  Béja: '🌲',
  Jendouba: '🌳',
  'Le Kef': '🗻',
  Siliana: '🌻',
  Sousse: '🏖️',
  Monastir: '🕌',
  Mahdia: '🌊',
  Sfax: '🏭',
  Kairouan: '🕌',
  Kasserine: '🏔️',
  'Sidi Bouzid': '☀️',
  Gabès: '🌴',
  Médenine: '🏜️',
  Tataouine: '⭐',
  Gafsa: '⛏️',
  Tozeur: '🌴',
  Kébili: '🐪',
}

function emojiFor(nameFr: string): string {
  const trimmed = nameFr.trim()
  if (GOV_EMOJIS[trimmed]) return GOV_EMOJIS[trimmed]
  const hit = Object.keys(GOV_EMOJIS).find(k => k.toLowerCase() === trimmed.toLowerCase())
  return hit ? GOV_EMOJIS[hit] : '📍'
}

interface GovernorateCarouselProps {
  governorates: Governorate[]
  selected: Governorate | null
  onSelect: (gov: Governorate) => void
}

export default function GovernorateCarousel({ governorates, selected, onSelect }: GovernorateCarouselProps) {
  const { locale, t } = useStoreLanguage()

  const primaryName = (gov: Governorate) =>
    locale === 'ar' && gov.name_ar?.trim() ? gov.name_ar.trim() : gov.name_fr
  const secondaryName = (gov: Governorate) => (locale === 'ar' ? gov.name_fr : gov.name_ar)

  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        {governorates.length > 0
          ? t('gov.intro', { n: governorates.length })
          : t('gov.loading')}
      </p>

      <div
        className="max-h-[min(55vh,520px)] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--border-card)] bg-[#0A1220] p-3 sm:p-4 shadow-inner"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {governorates.map(gov => {
            const isSelected = selected?.id === gov.id
            return (
              <motion.button
                key={gov.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(gov)}
                className={`relative flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 text-center transition-all sm:min-h-[96px] sm:p-3 ${
                  isSelected
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 shadow-md ring-2 ring-[var(--cyan)]/20'
                    : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--cyan)]/50 hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {isSelected && (
                  <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cyan)] sm:right-2 sm:top-2">
                    <Check className="h-3 w-3 text-[var(--text-on-badge)]" />
                  </div>
                )}
                <span className="text-xl sm:text-2xl" aria-hidden>
                  {emojiFor(gov.name_fr)}
                </span>
                <div className="min-w-0 px-0.5">
                  <p
                    className={`text-[11px] font-bold leading-tight sm:text-xs ${
                      isSelected ? 'text-[var(--cyan)]' : 'text-[var(--text-primary)]'
                    }`}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {primaryName(gov)}
                  </p>
                  {secondaryName(gov)?.trim() && (
                    <p
                      className="mt-0.5 text-[10px] leading-tight text-[var(--text-secondary)] sm:text-xs"
                      dir={locale === 'ar' ? 'ltr' : 'rtl'}
                    >
                      {secondaryName(gov)}
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {!selected && governorates.length > 0 && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {t('gov.required')}
        </p>
      )}
      {selected && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 px-3 py-2">
          <span className="text-lg">{emojiFor(selected.name_fr)}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--cyan)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {primaryName(selected)}
            </p>
            {secondaryName(selected)?.trim() && (
              <p
                className="text-xs text-[var(--text-secondary)]"
                dir={locale === 'ar' ? 'ltr' : 'rtl'}
              >
                {secondaryName(selected)}
              </p>
            )}
          </div>
          <Check className="ms-auto h-4 w-4 flex-shrink-0 text-[var(--cyan)]" />
        </div>
      )}
    </div>
  )
}
