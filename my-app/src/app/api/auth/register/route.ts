import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/schemas'
import { createAdminClient } from '@/lib/supabase/admin'

const DB_SIGNUP_ERROR = 'Database error saving new user'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const data = parsed.data

  try {
    const admin = createAdminClient()

    const { data: authData, error: createError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        district: data.district,
      },
    })

    if (createError) {
      const message =
        createError.message === DB_SIGNUP_ERROR
          ? 'Supabase signup trigger failed. Open Supabase → SQL Editor and run supabase/migrations/20250603120000_fix_user_signup_trigger.sql, then try again.'
          : createError.message

      return NextResponse.json({ error: message }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User was not created' }, { status: 500 })
    }

    const { error: profileError } = await admin.from('users').upsert(
      {
        id: userId,
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        district: data.district,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      return NextResponse.json(
        {
          error:
            'Account created in Auth but profile save failed. Run supabase/migrations/20250603120000_fix_user_signup_trigger.sql in the Supabase SQL Editor.',
          detail: profileError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ role: data.role })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
