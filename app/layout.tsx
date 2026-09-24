import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { FacebookPixel } from '@/components/FacebookPixel'
import FacebookPixelHead from '@/components/FacebookPixelHead'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import {
  resolveDomainVerification,
  resolveFacebookPixelId,
  resolveMetaTestEventCode,
} from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'

export const dynamic = 'force-dynamic'

async function getDomainVerificationCode(): Promise<string> {
  const fromEnv = resolveDomainVerification({})
  if (fromEnv) return fromEnv
  const settings = await fetchSettings(['domain_verification_content', 'facebook_pixel_id'])
  return resolveDomainVerification(settings)
}

export async function generateMetadata(): Promise<Metadata> {
  const domainVerification = await getDomainVerificationCode()

  return {
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
      images: [{ url: '/logo-alfakhama.png', width: 512, height: 512, alt: 'AL FAKHAMA STORE' }],
    },
    icons: {
      icon: [{ url: '/logo-alfakhama.png', type: 'image/png' }],
      apple: [{ url: '/logo-alfakhama.png', type: 'image/png' }],
      shortcut: '/logo-alfakhama.png',
    },
    ...(domainVerification
      ? {
          verification: {
            other: {
              'facebook-domain-verification': [domainVerification],
            },
          },
        }
      : {}),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [domainVerification, settings] = await Promise.all([
    getDomainVerificationCode(),
    fetchSettings(['facebook_pixel_id', 'meta_test_event_code']),
  ])
  const fbPixelId = resolveFacebookPixelId(settings)
  const testEventCode = resolveMetaTestEventCode(settings)

  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <FacebookPixelHead pixelId={fbPixelId} testEventCode={testEventCode || undefined} />
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
