'use client'

import { useState } from 'react'

type PayHereCheckoutCardProps = {
  cropName: string
  listingId: string
  quantityKg: number
  unitPriceLkr: number
  district?: string
}

export function PayHereCheckoutCard({
  cropName,
  listingId,
  quantityKg,
  unitPriceLkr,
  district,
}: PayHereCheckoutCardProps) {
  const [loading, setLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<'payhere' | 'demo-free'>('demo-free')

  async function startPayment() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/payments/payhere/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          cropName,
          quantityKg,
          unitPriceLkr,
          email: 'retailer@krushilink.local',
          phone: '+94771234567',
          firstName: 'Retailer',
          lastName: 'User',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data?.error ?? 'Checkout creation failed.')
        setLoading(false)
        return
      }

      if (data?.ready) {
        setMode(data?.mode === 'payhere' ? 'payhere' : 'demo-free')
        setCheckoutUrl(data.checkoutUrl ?? null)
        setMessage(
          data?.mode === 'payhere'
            ? 'PayHere checkout is ready. Continue to the secure payment page.'
            : data?.message ?? 'Free demo payment is active for local development.'
        )

        if (data?.mode === 'payhere' && data.checkoutUrl) {
          window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer')
        }
      } else {
        setMessage(data?.next ?? 'Payment setup is not ready yet.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start payment.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = quantityKg * unitPriceLkr
  const platformFee = Math.round(subtotal * 0.03)
  const total = subtotal + platformFee

  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            {mode === 'payhere' ? 'PayHere' : 'Free demo payment'}
          </p>
          <h4 className="mt-1 text-base font-black text-zinc-900">{cropName}</h4>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-700">LKR {total.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-500">{quantityKg} kg · {district ?? 'District'}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-600">
        <div className="rounded-lg bg-white px-2 py-2">
          <div className="text-zinc-400">Subtotal</div>
          <div className="mt-1 font-bold text-zinc-800">LKR {subtotal.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-white px-2 py-2">
          <div className="text-zinc-400">Fee</div>
          <div className="mt-1 font-bold text-zinc-800">LKR {platformFee.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-white px-2 py-2">
          <div className="text-zinc-400">Total</div>
          <div className="mt-1 font-bold text-emerald-700">LKR {total.toLocaleString()}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Preparing checkout...' : mode === 'payhere' ? 'Pay with PayHere' : 'Use free demo payment'}
      </button>

      {message && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-zinc-700">
          {message}
        </p>
      )}

      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline"
        >
          Open secure checkout page
        </a>
      )}
    </div>
  )
}
