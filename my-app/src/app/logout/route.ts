import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const url = new URL(request.url)
  const response = NextResponse.redirect(new URL('/login', url.origin))
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  return response
}
