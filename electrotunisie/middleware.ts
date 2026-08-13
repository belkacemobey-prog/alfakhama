import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { categoryNameFromProductPathSegment } from '@/lib/category-routes'

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const parts = pathname.split('/').filter(Boolean)

  // /products/<slug> → /products?category=<canonical name>
  if (parts[0] === 'products' && parts.length === 2) {
    const cat = categoryNameFromProductPathSegment(parts[1])
    if (cat) {
      const url = request.nextUrl.clone()
      url.pathname = '/products'
      url.searchParams.set('category', cat)
      return NextResponse.redirect(url)
    }
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoginPage = pathname === '/admin/login'

  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/products/:path*'],
}
