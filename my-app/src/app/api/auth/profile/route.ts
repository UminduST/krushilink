import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/server'

/** Create the signed-in user's profile row (client signUp fallback path). */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.pick({
    role: true,
    full_name: true,
    phone: true,
    district: true,
  }).safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: user.id,
      role: parsed.data.role,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      district: parsed.data.district,
    },
    { onConflict: 'id' }
  )

  if (profileError) {
    return NextResponse.json(
      {
        error: 'Could not save profile. Run supabase/migrations/20250603120000_fix_user_signup_trigger.sql in Supabase SQL Editor.',
        detail: profileError.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
