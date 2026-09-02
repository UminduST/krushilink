import { NextResponse } from 'next/server'
import { buildPayHereCheckout, escrowAmountLkr, getPayHereCheckoutUrl, isPayHereConfigured } from '@/lib/payments/payhere'
import { createClient } from '@/lib/supabase/server'

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
    listingId?: unknown
    quantityKg?: unknown
    cropName?: unknown
    unitPriceLkr?: unknown
    email?: unknown
    phone?: unknown
    firstName?: unknown
    lastName?: unknown
  }

  const quantityKg = Number(payload.quantityKg)
  if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
    return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 })
  }

  const unitPriceLkr = Number(payload.unitPriceLkr ?? 0)
  if (!Number.isFinite(unitPriceLkr) || unitPriceLkr <= 0) {
    return NextResponse.json({ error: 'Unit price must be greater than 0' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in as a retailer to pay' }, { status: 401 })
  }

  const amounts = escrowAmountLkr(quantityKg, unitPriceLkr)
  const orderId = `krushilink_${Date.now()}_${String(payload.listingId ?? 'listing')}`
  const email = typeof payload.email === 'string' && payload.email ? payload.email : user.email ?? 'retailer@example.com'
  const phone = typeof payload.phone === 'string' && payload.phone ? payload.phone : '+94771234567'
  const firstName = typeof payload.firstName === 'string' && payload.firstName ? payload.firstName : 'Retailer'
  const lastName = typeof payload.lastName === 'string' && payload.lastName ? payload.lastName : 'Customer'

  if (!isPayHereConfigured()) {
    return NextResponse.json({
      ready: true,
      mode: 'demo-free',
      paymentReference: `demo-${orderId}`,
      cropName: typeof payload.cropName === 'string' ? payload.cropName : 'Harvest',
      listingId: typeof payload.listingId === 'string' ? payload.listingId : null,
      amounts,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/retailer/dashboard`,
      message: 'PayHere credentials are not configured, so a free sandbox demo payment is being used for local development.',
    })
  }

  const checkout = buildPayHereCheckout({
    orderId,
    amount: amounts.total,
    firstName,
    lastName,
    email,
    phone,
    address: 'KrushiLink marketplace',
    city: 'Colombo',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/retailer/dashboard`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/retailer/browse`,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/payments/payhere/notify`,
  })

  return NextResponse.json({
    ready: true,
    mode: 'payhere',
    cropName: typeof payload.cropName === 'string' ? payload.cropName : 'Harvest',
    listingId: typeof payload.listingId === 'string' ? payload.listingId : null,
    amounts,
    checkoutUrl: getPayHereCheckoutUrl(),
    paymentReference: orderId,
    payload: checkout,
  })
}
