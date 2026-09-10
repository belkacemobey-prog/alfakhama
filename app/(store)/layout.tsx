export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import WhatsAppButton from '@/components/store/WhatsAppButton'
import { StoreLanguageProvider } from '@/components/store/StoreLanguageProvider'
import { fetchSettings } from '@/lib/site-settings-server'
import { DEFAULT_STORE_PHONE, DEFAULT_WHATSAPP } from '@/lib/phone'

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 bg-[#070D1A] border-b border-[#0D1628]">
      <div className="h-[30px] bg-[#070D1A] border-b border-[#0D1628]" />
      <div className="h-16 max-w-7xl mx-auto px-10" />
    </header>
  )
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await fetchSettings([
    'store_name',
    'store_phone',
    'store_address',
    'whatsapp_number',
  ])

  const storePhone = settings.store_phone || process.env.NEXT_PUBLIC_STORE_PHONE || DEFAULT_STORE_PHONE
  const whatsappNumber =
    settings.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    storePhone ||
    DEFAULT_WHATSAPP
  const storeAddress = settings.store_address || ''
  const storeName = settings.store_name || 'AL FAKHAMA STORE'

  return (
    <StoreLanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<NavbarFallback />}>
          <Navbar storePhone={storePhone} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer storePhone={storePhone} storeAddress={storeAddress} />
        <CartDrawer />
        <WhatsAppButton phone={whatsappNumber} storeName={storeName} />
      </div>
    </StoreLanguageProvider>
  )
}
