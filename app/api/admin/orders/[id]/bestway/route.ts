import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import {
  bestwayAddParcel,
  bestwayPhone,
  bestwayPostalCode,
} from '@/lib/bestway'
import { isSecretPlaceholder } from '@/lib/site-settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeUrl(raw: string | undefined): string {
  try {
    if (raw) {
      new URL(raw)
      return raw
    }
  } catch {
    /* ignore */
  }
  return 'https://placeholder.supabase.co'
}

async function requireAdmin() {
  const url = safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  const cookieStore = cookies()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  }
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle()
  if (!admin) {
    return { error: NextResponse.json({ error: 'Accès admin requis' }, { status: 403 }) }
  }
  return { supabase }
}

function serviceDb() {
  const url = safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function loadSettingMap(
  db: ReturnType<typeof createServerClient> | ReturnType<typeof createServiceClient>,
  keys: string[]
) {
  const { data, error } = await db.from('settings').select('key, value').in('key', keys)
  if (error) {
    console.error('[bestway] settings load:', error.message)
  }
  const map: Record<string, string> = {}
  data?.forEach((row: { key: string; value: string | null }) => {
    if (row.value && !isSecretPlaceholder(row.value)) map[row.key] = row.value
  })
  return map
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const orderId = params.id
  const db = auth.supabase!

  const { data: order, error: orderErr } = await db
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (order.delivery_barcode) {
    // Already uploaded — just ensure status
    await db
      .from('orders')
      .update({
        status: 'telecharge',
        delivery_carrier: order.delivery_carrier || 'bestway',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    return NextResponse.json({
      ok: true,
      already: true,
      barcode: order.delivery_barcode,
      status: 'telecharge',
    })
  }

  // Read with admin session (RLS: Admins can read all settings)
  let settings = await loadSettingMap(db, [
    'bestway_login',
    'bestway_password',
    'bestway_modalite',
    'bestway_open_parcel',
    'bestway_fragile',
  ])

  // Fallback: service role if configured (bypasses RLS)
  if (!settings.bestway_login || !settings.bestway_password) {
    const viaService = await loadSettingMap(serviceDb(), [
      'bestway_login',
      'bestway_password',
      'bestway_modalite',
      'bestway_open_parcel',
      'bestway_fragile',
    ])
    settings = { ...viaService, ...settings }
  }

  const login = (settings.bestway_login || process.env.BESTWAY_LOGIN || '').trim()
  const password = (settings.bestway_password || process.env.BESTWAY_PASSWORD || '').trim()

  if (!login || !password) {
    return NextResponse.json(
      {
        error:
          'Identifiants BestWay manquants. Allez dans Admin → Paramètres → Livraison BestWay, saisissez login + mot de passe, puis Sauvegarder.',
      },
      { status: 400 }
    )
  }

  const { data: items } = await db.from('order_items').select('*').eq('order_id', orderId)
  const designation =
    (items || [])
      .map((i: { product_name: string; quantity: number }) => `${i.product_name} x${i.quantity}`)
      .join(' | ')
      .slice(0, 240) || order.order_number

  const nombre_piece = Math.max(
    1,
    (items || []).reduce((s: number, i: { quantity: number }) => s + (i.quantity || 0), 0)
  )

  const tel = bestwayPhone(order.customer_phone)
  if (tel.length !== 8) {
    return NextResponse.json({ error: 'Téléphone client invalide pour BestWay' }, { status: 400 })
  }

  // BestWay exige `code` = code postal du gouvernorat (sinon erreur PHP côté API)
  const postal = bestwayPostalCode(order.governorate_name)
  if (!postal) {
    return NextResponse.json(
      {
        error: `Code postal BestWay introuvable pour le gouvernorat « ${order.governorate_name} ». Vérifiez le nom du gouvernorat sur la commande.`,
      },
      { status: 400 }
    )
  }

  try {
    const result = await bestwayAddParcel({
      login,
      password,
      reference: order.order_number,
      designation,
      montant_reception: String(Number(order.total_amount) || 0),
      modalite: settings.bestway_modalite || '2',
      contenuEchange: '',
      code: postal,
      tel,
      adresse: (order.address || order.governorate_name || 'Tunisie').slice(0, 200),
      nom: order.customer_name,
      nombre_piece,
      open_parcel: Number(settings.bestway_open_parcel ?? 0) ? 1 : 0,
      fragile: Number(settings.bestway_fragile ?? 0) ? 1 : 0,
    })

    const barcode = result.code_barre || result.pck_code || ''
    const pck = result.pck_code || barcode
    const noteLine = barcode ? `BestWay barcode: ${barcode}` : 'BestWay: colis téléchargé'
    const notes = order.notes?.includes(noteLine)
      ? order.notes
      : [order.notes, noteLine].filter(Boolean).join('\n')

    // 1) Toujours passer en "telecharge" (sans colonnes delivery_* — évite schema cache)
    const { error: statusErr } = await db
      .from('orders')
      .update({
        status: 'telecharge',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (statusErr) {
      console.error('[bestway] status=telecharge failed', statusErr.message)
      await db
        .from('orders')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      return NextResponse.json({
        ok: true,
        barcode,
        pck_code: pck,
        status: 'confirmed',
        warning:
          `Colis créé (barcode ${barcode}). Exécutez supabase/bestway-delivery.sql dans Supabase SQL Editor pour autoriser le statut « telecharge ».`,
      })
    }

    // 2) Enrichir avec barcode / carrier si les colonnes existent
    const { error: enrichErr } = await db
      .from('orders')
      .update({
        delivery_carrier: 'bestway',
        delivery_barcode: barcode || null,
        delivery_pck_code: pck || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (enrichErr) {
      console.warn('[bestway] delivery_* columns missing — status telecharge OK:', enrichErr.message)
    }

    return NextResponse.json({
      ok: true,
      barcode,
      pck_code: pck,
      status: 'telecharge',
      warning: enrichErr
        ? 'Statut Téléchargé OK. Exécutez supabase/bestway-delivery.sql pour stocker le code-barres en colonne.'
        : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur BestWay'
    console.error('[bestway]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
