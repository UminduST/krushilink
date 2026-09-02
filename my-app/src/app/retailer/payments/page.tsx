'use client'

import { PayHereCheckoutCard } from '@/components/ui/PayHereCheckoutCard'
import { SmsSendCard } from '@/components/ui/SmsSendCard'
import { getNearbyDistricts } from '@/lib/maps/districts'

const district = 'Colombo'
const nearby = getNearbyDistricts(district, 80)

export default function RetailerPaymentsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#f8fafc_40%,_#f1f5f9_100%)] p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">Payment gateway</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">KrushiLink payments</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Free demo payment, SMS notifications, and district geofencing in one operational dashboard.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 shadow-[0_12px_28px_rgba(16,185,129,0.08)] lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">District matching</p>
            <h2 className="mt-2 text-xl font-black text-zinc-900">{district} zone coverage</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {nearby.slice(0, 8).map((item) => (
                <span key={item.name} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  {item.name} · {item.distanceKm} km
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-[0_12px_28px_rgba(245,158,11,0.08)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">SMS gateway</p>
            <h2 className="mt-2 text-xl font-black text-zinc-900">Dispatch alerts</h2>
            <p className="mt-2 text-sm text-zinc-600">Send order and payment notifications using the local free SMS flow.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
            <PayHereCheckoutCard
              cropName="Keeri Samba Paddy"
              listingId="demo-paddy-01"
              quantityKg={250}
              unitPriceLkr={310}
              district={district}
            />
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
            <SmsSendCard
              phone="+94771234567"
              message="Payment confirmed for your harvest order. Dispatch details will be shared shortly."
            />
          </div>
        </section>
      </div>
    </main>
  )
}
