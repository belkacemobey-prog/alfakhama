export const STORE_SETTING_KEYS = [
  'store_name',
  'store_phone',
  'store_address',
  'whatsapp_number',
  'delivery_fee',
  'free_delivery_threshold',
] as const

export const INTEGRATION_SETTING_KEYS = [
  'supabase_url',
  'supabase_anon_key',
  'supabase_service_role_key',
  'facebook_pixel_id',
  'domain_verification_content',
] as const

export const PUBLIC_SETTINGS_KEYS = [
  ...STORE_SETTING_KEYS,
  'facebook_pixel_id',
  'domain_verification_content',
  'supabase_url',
  'supabase_anon_key',
] as const

export type SiteSettings = Record<string, string>

export function resolveSupabaseUrl(settings: SiteSettings): string {
  const raw = settings.supabase_url || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  try {
    if (raw) {
      new URL(raw)
      return raw
    }
  } catch {
    /* fall through */
  }
  return 'https://placeholder.supabase.co'
}

export function resolveSupabaseAnonKey(settings: SiteSettings): string {
  return settings.supabase_anon_key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
}

export function resolveSupabaseServiceRoleKey(settings: SiteSettings): string {
  return settings.supabase_service_role_key || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
}

export function resolveFacebookPixelId(settings: SiteSettings): string {
  return settings.facebook_pixel_id || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''
}

export function resolveDomainVerification(settings: SiteSettings): string {
  return settings.domain_verification_content || ''
}

export const SECRET_SETTING_PLACEHOLDER = '••••••••••••'

export function isSecretPlaceholder(value: string): boolean {
  return value === SECRET_SETTING_PLACEHOLDER || value.includes('••••')
}
