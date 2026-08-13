import { createClient } from '@/lib/supabase-server'
import type { SiteSettings } from '@/lib/site-settings'

export async function fetchSettings(keys: readonly string[]): Promise<SiteSettings> {
  const supabase = createClient()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [...keys])

  const map: SiteSettings = {}
  data?.forEach(row => {
    if (row.value) map[row.key] = row.value
  })
  return map
}
