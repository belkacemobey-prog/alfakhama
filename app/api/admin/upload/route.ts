import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const BUCKET =
  typeof process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET.trim()
    ? process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET.trim()
    : 'products'

const MAX_BYTES = 5 * 1024 * 1024

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

function isServiceRoleConfigured(): boolean {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(k && k.length > 40 && !k.includes('placeholder'))
}

export async function POST(request: Request) {
  const url = safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  const cookieStore = cookies()

  const supabaseUser = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        /* Session refresh on upload is handled by middleware; avoid cookie write errors in Route Handlers */
      },
    },
  })

  const {
    data: { session },
  } = await supabaseUser.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const f = file as File
  const mime = f.type || 'application/octet-stream'
  if (!mime.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }
  if (f.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  const dot = f.name.lastIndexOf('.')
  const extRaw = dot >= 0 ? f.name.slice(dot + 1).toLowerCase() : ''
  const ext = /^[a-z0-9]{1,8}$/.test(extRaw) ? extRaw : 'jpg'
  const path = `uploads/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await f.arrayBuffer())

  if (isServiceRoleConfigured()) {
    const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    })
    if (error) {
      return NextResponse.json(
        { error: error.message, hint: 'Check that the storage bucket exists and is named correctly.' },
        { status: 502 }
      )
    }
  } else {
    const { error } = await supabaseUser.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    })
    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint:
            'Add SUPABASE_SERVICE_ROLE_KEY to server env for uploads without Storage RLS, or apply policies in supabase/storage.sql.',
        },
        { status: 502 }
      )
    }
  }

  const { data: pub } = supabaseUser.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ publicUrl: pub.publicUrl })
}
