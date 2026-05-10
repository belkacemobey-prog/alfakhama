import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'ElectroTunisie — Électroménager en Tunisie',
    template: '%s | ElectroTunisie',
  },
  description: 'La meilleure boutique en ligne d\'électroménager en Tunisie. Samsung, LG, Beko, Brandt, Iris et plus. Livraison dans toute la Tunisie.',
  keywords: 'électroménager, tunisie, réfrigérateur, machine à laver, climatiseur, TV, samsung, LG',
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: 'ElectroTunisie',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif' },
          }}
        />
      </body>
    </html>
  )
}
