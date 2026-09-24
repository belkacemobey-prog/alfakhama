import { NextRequest, NextResponse } from 'next/server'
import {
  resolveFacebookPixelId,
  resolveMetaCapiAccessToken,
  resolveMetaTestEventCode,
} from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CapiBody = {
  event_name: string
  event_id?: string
  event_source_url?: string
  value?: number
  currency?: string
  content_ids?: string[]
  contents?: { id: string; quantity: number; item_price?: number }[]
  num_items?: number
  test_event_code?: string
  client_user_agent?: string
  fbp?: string
  fbc?: string
}

/**
 * Meta Conversions API — so Test Events shows activity even when browser pixel
 * is blocked (adblock / localhost). Uses settings token + optional test_event_code.
 */
export async function POST(req: NextRequest) {
  let body: CapiBody
  try {
    body = (await req.json()) as CapiBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.event_name) {
    return NextResponse.json({ error: 'event_name required' }, { status: 400 })
  }

  const settings = await fetchSettings([
    'facebook_pixel_id',
    'meta_capi_access_token',
    'meta_test_event_code',
  ])
  const pixelId = resolveFacebookPixelId(settings)
  const accessToken = resolveMetaCapiAccessToken(settings)
  const testEventCode =
    body.test_event_code?.trim() || resolveMetaTestEventCode(settings)

  if (!pixelId) {
    return NextResponse.json({ error: 'Pixel ID manquant (Admin → Paramètres)' }, { status: 400 })
  }
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Clé API de conversion manquante (Admin → Paramètres)' },
      { status: 400 }
    )
  }

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined
  const ua = body.client_user_agent || req.headers.get('user-agent') || undefined

  const customData: Record<string, unknown> = {}
  if (body.value != null) customData.value = Number(body.value)
  if (body.currency) customData.currency = body.currency
  if (body.content_ids?.length) customData.content_ids = body.content_ids
  if (body.contents?.length) customData.contents = body.contents
  if (body.num_items != null) customData.num_items = body.num_items
  customData.content_type = 'product'

  const userData: Record<string, string> = {}
  if (ip) userData.client_ip_address = ip
  if (ua) userData.client_user_agent = ua
  if (body.fbp) userData.fbp = body.fbp
  if (body.fbc) userData.fbc = body.fbc

  const event: Record<string, unknown> = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
    custom_data: customData,
  }
  if (body.event_id) event.event_id = body.event_id
  if (body.event_source_url) event.event_source_url = body.event_source_url

  const payload: Record<string, unknown> = {
    data: [event],
    access_token: accessToken,
  }
  if (testEventCode) payload.test_event_code = testEventCode

  const url = `https://graph.facebook.com/v21.0/${pixelId}/events`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error('[meta-capi]', json)
    return NextResponse.json(
      { error: (json as { error?: { message?: string } })?.error?.message || 'CAPI failed', details: json },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    events_received: (json as { events_received?: number }).events_received,
    test_event_code: testEventCode || null,
    fbtrace_id: (json as { fbtrace_id?: string }).fbtrace_id,
  })
}
