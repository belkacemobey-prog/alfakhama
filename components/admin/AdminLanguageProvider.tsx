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
import { type AdminLocale, ADMIN_LOCALE_KEY, translateAdmin } from '@/lib/admin-i18n'

type Ctx = {
  locale: AdminLocale
  setLocale: (l: AdminLocale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const AdminLangContext = createContext<Ctx | null>(null)

function readStoredLocale(): AdminLocale | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(ADMIN_LOCALE_KEY)
    return v === 'ar' || v === 'fr' ? v : null
  } catch {
    return null
  }
}

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('fr')

  useEffect(() => {
    const stored = readStoredLocale()
    if (stored) setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: AdminLocale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(ADMIN_LOCALE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'fr'
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translateAdmin(locale, key, vars),
    [locale]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export function useAdminLanguage(): Ctx {
  const ctx = useContext(AdminLangContext)
  if (!ctx) {
    throw new Error('useAdminLanguage must be used within AdminLanguageProvider')
  }
  return ctx
}
