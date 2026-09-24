'use client'

import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'
import { FacebookPixelEvents } from '@/components/FacebookPixelEvents'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    __META_TEST_EVENT_CODE?: string
  }
}

function ensurePixel(pixelId: string) {
  const id = pixelId.replace(/\D/g, '')
  if (!id || typeof window === 'undefined') return

  if (typeof window.fbq === 'function') {
    // Already bootstrapped from <head> — do not double PageView here
    return
  }

  const w = window as Window & { _fbq?: unknown }
  const n = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = n as any
    fn.callMethod ? fn.callMethod.apply(fn, args) : fn.queue.push(args)
  } as ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void
    queue: unknown[]
    loaded: boolean
    version: string
    push: (...args: unknown[]) => void
  }
  if (!w._fbq) w._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  w.fbq = n

  const t = document.createElement('script')
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const s = document.getElementsByTagName('script')[0]
  s?.parentNode?.insertBefore(t, s)

  w.fbq('init', id)
  w.fbq('track', 'PageView')
}

/**
 * Client pixel: SPA PageViews + fallback init if head snippet had no ID.
 */
export function FacebookPixel({ pixelId }: { pixelId: string }) {
  const [resolvedId, setResolvedId] = useState(pixelId.replace(/\D/g, ''))

  useEffect(() => {
    // Capture Meta Test Events code from URL (?test_event_code=TEST…)
    try {
      const sp = new URLSearchParams(window.location.search)
      const fromUrl = sp.get('test_event_code') || sp.get('testEventCode')
      if (fromUrl) {
        sessionStorage.setItem('meta_test_event_code', fromUrl)
        window.__META_TEST_EVENT_CODE = fromUrl
      } else if (!window.__META_TEST_EVENT_CODE) {
        const stored = sessionStorage.getItem('meta_test_event_code')
        if (stored) window.__META_TEST_EVENT_CODE = stored
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      let id = resolvedId
      if (!id) {
        try {
          const res = await fetch('/api/settings/public')
          const data = await res.json()
          id = String(data.facebook_pixel_id || '').replace(/\D/g, '')
          if (!cancelled && id) setResolvedId(id)
        } catch {
          return
        }
      }
      if (!cancelled && id) ensurePixel(id)
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [resolvedId])

  if (!resolvedId) return null

  return (
    <>
      {/* Fallback if head bootstrap missing (keeps noscript beacon) */}
      <Script id="meta-pixel-fallback" strategy="afterInteractive">
        {`if(!window.fbq){(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${resolvedId}');fbq('track','PageView');}`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${resolvedId}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelEvents />
      </Suspense>
    </>
  )
}
