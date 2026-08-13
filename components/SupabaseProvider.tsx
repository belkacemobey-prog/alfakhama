'use client'

import { configureSupabaseClient } from '@/lib/supabase'
import { useEffect } from 'react'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.supabase_url && data.supabase_anon_key) {
          configureSupabaseClient(data.supabase_url, data.supabase_anon_key)
        }
      })
      .catch(() => {
        /* keep env defaults */
      })
  }, [])

  return <>{children}</>
}
