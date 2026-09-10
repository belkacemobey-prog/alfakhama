import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

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

function serviceRoleLooksValid(key: string | undefined): boolean {
  if (!key || key.length < 40 || key.includes('placeholder')) return false
  // Reject if someone pasted the anon / publishable key by mistake
  if (key.startsWith('sb_publishable_')) return false
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString('utf8'))
    if (payload?.role && payload.role !== 'service_role') return false
  } catch {
    /* non-JWT keys: allow */
  }
  return true
}

async function requireAdmin() {
  const url = safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  const cookieStore = cookies()

  const supabaseUser = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })

  const {
    data: { session },
  } = await supabaseUser.auth.getSession()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  }

  const { data: admin } = await supabaseUser
    .from('admin_users')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle()

  if (!admin) {
    return { error: NextResponse.json({ error: 'Accès admin requis' }, { status: 403 }) }
  }

  return { supabaseUser, session }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const productId = params.id
  if (!productId) {
    return NextResponse.json({ error: 'ID produit manquant' }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const url = safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const useService = serviceRoleLooksValid(serviceKey)

  const db = useService
    ? createSupabaseJsClient(url, serviceKey!, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : auth.supabaseUser!

  // Detach from past orders so FK does not block delete
  const unlink = await db.from('order_items').update({ product_id: null }).eq('product_id', productId)
  if (unlink.error && !useService) {
    // Continue — may still work if ON DELETE SET NULL is already applied
    console.warn('[delete product] unlink:', unlink.error.message)
  }

  const { data, error } = await db.from('products').delete().eq('id', productId).select('id')

  if (error) {
    const msg = error.message || ''
    const isFk =
      /foreign key|violates foreign key|order_items/i.test(msg) || error.code === '23503'
    return NextResponse.json(
      {
        error: isFk
          ? 'Ce produit est lié à des commandes. Exécutez supabase/fix-product-delete.sql dans Supabase, puis réessayez.'
          : msg,
        code: error.code,
      },
      { status: 400 }
    )
  }

  if (!data?.length) {
    return NextResponse.json(
      {
        error:
          'Suppression refusée (RLS ou produit introuvable). Vérifiez que votre compte est dans admin_users.',
      },
      { status: 403 }
    )
  }

  return NextResponse.json({ ok: true, id: productId })
}
