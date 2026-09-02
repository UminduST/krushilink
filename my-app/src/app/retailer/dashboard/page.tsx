import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/session'
import { ListingStatusBadge } from '@/components/ui/StatusBadge'
import { PayHereCheckoutCard } from '@/components/ui/PayHereCheckoutCard'
import { SmsSendCard } from '@/components/ui/SmsSendCard'
import { AiAssistantPopup } from '@/components/ui/AiAssistantPopup'
import { getNearbyDistricts } from '@/lib/maps/districts'

export default async function RetailerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getUserProfile(user.id)

  const { data: openListings } = await supabase
    .from('harvest_listings')
    .select('*, farms(district, name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: myOrders } = await supabase
    .from('pool_orders')
    .select('*, demand_pools(district, harvest_listings(crop_name))')
    .eq('retailer_id', user.id)
    .order('confirmed_at', { ascending: false })
    .limit(5)

  const district = profile?.district ?? 'Colombo'
  const districtMatches = getNearbyDistricts(district, 80)

  return (
    <>
      <header className="border-b border-blue-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">
            Retailer portal
          </span>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Welcome, {profile?.full_name?.split(' ')[0]}!
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{profile?.district ?? 'Sri Lanka'} · Browse and join harvest pools</p>
            </div>
            <Link href="/retailer/browse" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
              Browse harvests
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-8">
        <AiAssistantPopup />

        <section className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Open harvests', value: openListings?.length ?? 0, accent: 'emerald', icon: '🌾' },
            { label: 'Your orders', value: myOrders?.length ?? 0, accent: 'blue', icon: '📦' },
            { label: 'District', value: profile?.district ?? '—', accent: 'amber', icon: '📍' },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{s.label}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-lg">{s.icon}</span>
              </div>
              <div className="mt-5 text-3xl font-black tracking-tight text-zinc-900">{s.value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 lg:col-span-2 shadow-[0_12px_28px_rgba(16,185,129,0.08)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">District matching</p>
            <h3 className="mt-2 text-xl font-black text-zinc-900">{district} coverage radius</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {districtMatches.slice(0, 6).map((item) => (
                <span key={item.name} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  {item.name} · {item.distanceKm} km
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">SMS gateway</p>
            <h3 className="mt-2 text-lg font-black text-zinc-900">Delivery alerts</h3>
            <p className="mt-2 text-sm text-zinc-600">Notify farmers and retailers with a free local message flow.</p>
            <Link href="/farmer/listings" className="mt-4 inline-block text-xs font-bold text-amber-700 underline">
              Open SMS tools
            </Link>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <div>
                <h3 className="text-lg font-black text-zinc-900">Latest open harvests</h3>
                <p className="mt-1 text-xs text-zinc-500">Fresh supply available nearby</p>
              </div>
              <Link href="/retailer/browse" className="text-xs font-bold text-blue-600 hover:underline">
                Browse all →
              </Link>
            </div>

            {!openListings?.length ? (
              <p className="p-8 text-center text-sm text-zinc-500">No open listings right now.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {openListings.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-4 p-4 transition hover:bg-zinc-50">
                    <div>
                      <p className="font-bold text-zinc-900">{l.crop_name}</p>
                      <p className="text-xs text-zinc-500">
                        {(l.farms as { district?: string })?.district} · {Number(l.quantity_kg).toLocaleString()} kg · LKR {l.base_price_lkr}/kg
                      </p>
                    </div>
                    <ListingStatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-black text-zinc-900">Gateway status</h3>
              <div className="mt-4">
                <PayHereCheckoutCard
                  cropName="Fresh harvest batch"
                  listingId="demo-listing"
                  quantityKg={120}
                  unitPriceLkr={320}
                  district={district}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-black text-zinc-900">Your recent orders</h3>
              {!myOrders?.length ? (
                <p className="mt-4 text-sm text-zinc-500">No orders yet. Browse harvests to join a pool.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {myOrders.map((o) => (
                    <li key={o.id} className="rounded-2xl bg-zinc-50 p-3">
                      <p className="font-bold text-zinc-900">
                        {(o.demand_pools as { harvest_listings?: { crop_name?: string } })?.harvest_listings?.crop_name ?? 'Pool order'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {Number(o.quantity_kg).toLocaleString()} kg · {o.payment_status}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <SmsSendCard
                phone="+94771234567"
                message="Your order is confirmed. Pickup and payment details are ready for dispatch."
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
