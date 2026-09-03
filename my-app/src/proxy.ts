import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isProtectedPath = pathname.startsWith('/farmer') || pathname.startsWith('/retailer')

  if (isProtectedPath) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  }

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    const role = user.user_metadata?.role as string | undefined
    const url = request.nextUrl.clone()
    url.pathname = role === 'retailer' ? '/retailer/dashboard' : '/farmer/dashboard'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/farmer')) {
    const role = user.user_metadata?.role as string | undefined
    if (role === 'retailer') {
      const url = request.nextUrl.clone()
      url.pathname = '/retailer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (user && pathname.startsWith('/retailer')) {
    const role = user.user_metadata?.role as string | undefined
    if (role === 'farmer') {
      const url = request.nextUrl.clone()
      url.pathname = '/farmer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
