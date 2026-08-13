import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { FacebookPixel } from '@/components/FacebookPixel'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import {
  INTEGRATION_SETTING_KEYS,
  resolveDomainVerification,
  resolveFacebookPixelId,
} from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'AL FAKHAMA STORE — Boutique Premium en Tunisie',
    template: '%s | AL FAKHAMA STORE',
  },
  description:
    'AL FAKHAMA STORE — électroménager et équipements de qualité en Tunisie. Livraison partout, paiement à la livraison.',
  keywords: 'al fakhama, store, électroménager, tunisie, luxe, réfrigérateur, TV, climatiseur',
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: 'AL FAKHAMA STORE',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await fetchSettings(INTEGRATION_SETTING_KEYS)
  const fbPixelId = resolveFacebookPixelId(settings)
  const domainVerification = resolveDomainVerification(settings)

  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {domainVerification ? (
          <meta name="facebook-domain-verification" content={domainVerification} />
        ) : null}
      </head>
      <body>
        <SupabaseProvider>
          <FacebookPixel pixelId={fbPixelId} />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif' },
            }}
          />
        </SupabaseProvider>
      </body>
    </html>
  )
}
