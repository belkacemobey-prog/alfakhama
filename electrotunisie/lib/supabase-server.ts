import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function safeUrl(raw: string | undefined): string {
  try { if (raw) { new URL(raw); return raw } } catch {}
  return 'https://placeholder.supabase.co'
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component - can't set cookies
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  return createServerClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
