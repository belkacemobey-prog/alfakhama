import { NextResponse } from 'next/server'
import {
  PUBLIC_SETTINGS_KEYS,
  resolveDomainVerification,
  resolveFacebookPixelId,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'
import { DEFAULT_STORE_PHONE, DEFAULT_WHATSAPP } from '@/lib/phone'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await fetchSettings(PUBLIC_SETTINGS_KEYS)

  const storePhone = settings.store_phone || process.env.NEXT_PUBLIC_STORE_PHONE || DEFAULT_STORE_PHONE
  const whatsapp =
    settings.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    storePhone ||
    DEFAULT_WHATSAPP

  return NextResponse.json({
    supabase_url: resolveSupabaseUrl(settings),
    supabase_anon_key: resolveSupabaseAnonKey(settings),
    facebook_pixel_id: resolveFacebookPixelId(settings),
    domain_verification_content: resolveDomainVerification(settings),
    store_name: settings.store_name || 'AL FAKHAMA STORE',
    store_phone: storePhone,
    store_address: settings.store_address || '',
    whatsapp_number: whatsapp,
  })
}
