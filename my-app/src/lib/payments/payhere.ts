/**
 * PayHere helpers for local sandbox and live LKR checkout.
 * We keep the merchant secret server-side and generate the MD5 hash only on the backend.
 */
import crypto from 'crypto'

export const PAYHERE_SANDBOX_CHECKOUT = 'https://sandbox.payhere.lk/pay/checkout'
export const PAYHERE_LIVE_CHECKOUT = 'https://www.payhere.lk/pay/checkout'

export const PAYHERE_METHODS = [
  { id: 'visa', label: 'Visa', hint: 'Card' },
  { id: 'mastercard', label: 'Mastercard', hint: 'Card' },
  { id: 'amex', label: 'Amex', hint: 'Card' },
  { id: 'ezcash', label: 'eZ Cash', hint: 'Wallet' },
  { id: 'mcash', label: 'mCash', hint: 'Wallet' },
  { id: 'bank', label: 'Bank transfer', hint: 'Online' },
] as const

export type PayHereMethodId = (typeof PAYHERE_METHODS)[number]['id']

export function isPayHereConfigured() {
  return Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET)
}

export function escrowAmountLkr(quantityKg: number, unitPriceLkr: number) {
  const subtotal = quantityKg * unitPriceLkr
  const platformFee = Math.round(subtotal * 0.03)
  return { subtotal, platformFee, total: subtotal + platformFee }
}

export function generatePayHereHash({
  merchantId,
  merchantSecret,
  orderId,
  amount,
  currency,
}: {
  merchantId: string
  merchantSecret: string
  orderId: string
  amount: number
  currency: string
}) {
  const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
  return crypto
    .createHash('md5')
    .update(`${merchantId}${orderId}${Number(amount).toFixed(2)}${currency}${secretHash}`)
    .digest('hex')
    .toUpperCase()
}

export function buildPayHereCheckout({
  orderId,
  amount,
  currency = 'LKR',
  firstName,
  lastName,
  email,
  phone,
  address,
  city,
  country = 'Sri Lanka',
  returnUrl,
  cancelUrl,
  notifyUrl,
}: {
  orderId: string
  amount: number
  currency?: string
  firstName: string
  lastName?: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
}) {
  const merchantId = process.env.PAYHERE_MERCHANT_ID
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

  if (!merchantId || !merchantSecret) {
    throw new Error('PayHere merchant credentials are not configured.')
  }

  const hash = generatePayHereHash({
    merchantId,
    merchantSecret,
    orderId,
    amount,
    currency,
  })

  return {
    merchant_id: merchantId,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    order_id: orderId,
    items: 'KrushiLink purchase',
    currency,
    amount: Number(amount).toFixed(2),
    first_name: firstName,
    last_name: lastName ?? 'Customer',
    email,
    phone,
    address: address ?? 'Sri Lanka',
    city: city ?? 'Colombo',
    country,
    hash,
  }
}

export function getPayHereCheckoutUrl() {
  return process.env.PAYHERE_SANDBOX === 'false' ? PAYHERE_LIVE_CHECKOUT : PAYHERE_SANDBOX_CHECKOUT
}
