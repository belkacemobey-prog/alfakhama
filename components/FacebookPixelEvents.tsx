'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { fbq, trackPageViewCapi } from '@/lib/fbq'

export function FacebookPixelEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  // Persist Meta Test Events code from URL for the session
  useEffect(() => {
    const code = searchParams.get('test_event_code') || searchParams.get('testEventCode')
    if (code) {
      try {
        sessionStorage.setItem('meta_test_event_code', code)
        window.__META_TEST_EVENT_CODE = code
      } catch {
        window.__META_TEST_EVENT_CODE = code
      }
      void trackPageViewCapi()
    }
  }, [searchParams])

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      // First paint PageView already fired in <head>; still ping CAPI if test code set
      void trackPageViewCapi()
      return
    }
    fbq('track', 'PageView')
    void trackPageViewCapi()
  }, [pathname])

  return null
}
