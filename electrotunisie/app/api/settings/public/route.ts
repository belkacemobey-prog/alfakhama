import { NextResponse } from 'next/server'
import {
  PUBLIC_SETTINGS_KEYS,
  resolveDomainVerification,
  resolveFacebookPixelId,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await fetchSettings(PUBLIC_SETTINGS_KEYS)

  return NextResponse.json({
    supabase_url: resolveSupabaseUrl(settings),
    supabase_anon_key: resolveSupabaseAnonKey(settings),
    facebook_pixel_id: resolveFacebookPixelId(settings),
    domain_verification_content: resolveDomainVerification(settings),
    whatsapp_number: settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  })
}
