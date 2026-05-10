'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type StoreLocale,
  STORE_LOCALE_KEY,
  translate,
} from '@/lib/store-i18n'

type Ctx = {
  locale: StoreLocale
  setLocale: (l: StoreLocale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<Ctx | null>(null)

function readStoredLocale(): StoreLocale | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(STORE_LOCALE_KEY)
    return v === 'ar' || v === 'fr' ? v : null
  } catch {
    return null
  }
}

export function StoreLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<StoreLocale>('fr')

  useEffect(() => {
    const stored = readStoredLocale()
    if (stored) setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: StoreLocale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(STORE_LOCALE_KEY, l)
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l === 'ar' ? 'ar' : 'fr'
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'fr'
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useStoreLanguage(): Ctx {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useStoreLanguage must be used within StoreLanguageProvider')
  }
  return ctx
}

/** Safe for rare use outside provider (falls back to French). */
export function useOptionalStoreLanguage(): Ctx | null {
  return useContext(LanguageContext)
}
