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

/**
 * Client pixel: SPA PageViews + fallback init if head snippet had no ID.
 */
export function FacebookPixel({ pixelId }: { pixelId: string }) {
  const [resolvedId, setResolvedId] = useState(() => String(pixelId || '').replace(/\D/g, ''))

  useEffect(() => {
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
    if (resolvedId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        const id = String(data.facebook_pixel_id || '').replace(/\D/g, '')
        if (!cancelled && id) setResolvedId(id)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [resolvedId])

  if (!resolvedId) return null

  // Meta's official bootstrap (string) — avoids ESLint issues with apply()/ternary expressions
  const bootstrap = `
if (!window.fbq) {
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${resolvedId}');
  fbq('track', 'PageView');
}
`.trim()

  return (
    <>
      <Script id="meta-pixel-fallback" strategy="afterInteractive">
        {bootstrap}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
