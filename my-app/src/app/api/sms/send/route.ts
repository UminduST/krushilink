import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const payload = body as {
    to?: unknown
    message?: unknown
  }

  const to = typeof payload.to === 'string' ? payload.to : ''
  const message = typeof payload.message === 'string' ? payload.message : ''

  if (!to || !message) {
    return NextResponse.json({ error: 'Phone number and message are required.' }, { status: 400 })
  }

  const apiKey = process.env.TEXTBELT_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      provider: 'demo-free',
      messageId: `sms-demo-${Date.now()}`,
      mode: 'local-sandbox',
      note: 'No SMS provider key was configured. This demo mode simulates an SMS send for local development.',
      to,
      message,
    })
  }

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: to, message, key: apiKey }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          ok: false,
          provider: 'textbelt',
          error: data?.message ?? 'SMS provider rejected the request.',
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      provider: 'textbelt',
      messageId: data?.textId ?? data?.id ?? `sms-${Date.now()}`,
      quotaRemaining: data?.quotaRemaining ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'textbelt',
        error: error instanceof Error ? error.message : 'Unknown SMS error',
      },
      { status: 500 },
    )
  }
}
