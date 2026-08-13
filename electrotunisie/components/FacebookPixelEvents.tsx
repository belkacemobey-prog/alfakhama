'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { fbq } from '@/lib/fbq'

export function FacebookPixelEvents() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    fbq('track', 'PageView')
  }, [pathname])

  return null
}
