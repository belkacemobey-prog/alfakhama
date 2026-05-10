export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import HomePageContent from '@/components/store/HomePageContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ElectroTunisie — Électroménager Premium en Tunisie',
  description:
    'Achetez les meilleurs électroménagers en Tunisie. Samsung, LG, Beko, Brandt, Iris. Livraison dans toute la Tunisie, paiement à la livraison.',
}

async function getHomeData() {
  const supabase = createClient()
  const [bannersRes, featuredRes, newArrivalsRes] = await Promise.all([
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order').limit(5),
    supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
  ])
  return {
    banners: bannersRes.data || [],
    featured: featuredRes.data || [],
    newArrivals: newArrivalsRes.data || [],
  }
}

export default async function HomePage() {
  const { banners, featured, newArrivals } = await getHomeData()

  return (
    <HomePageContent
      banners={banners as any}
      featured={(featured as any) || []}
      newArrivals={(newArrivals as any) || []}
    />
  )
}
