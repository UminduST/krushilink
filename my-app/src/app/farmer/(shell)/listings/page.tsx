import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingStatusBadge } from '@/components/ui/StatusBadge'
import { SmsSendCard } from '@/components/ui/SmsSendCard'
import { getNearbyDistricts } from '@/lib/maps/districts'
import type { HarvestListing } from '@/lib/types'

export default async function FarmerListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: farms } = await supabase.from('farms').select('id').eq('owner_id', user.id)
  const farmIds = farms?.map((f) => f.id) ?? []

  const { data: listings } = farmIds.length > 0
    ? await supabase.from('harvest_listings')
        .select('*')
        .in('farm_id', farmIds)
        .order('created_at', { ascending: false })
    : { data: [] as HarvestListing[] }

  const district = 'Colombo'
  const nearbyDistricts = getNearbyDistricts(district, 80)

  return (
    <>
      <header className="border-b border-emerald-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Crop management</h1>
            <p className="mt-1 text-sm text-zinc-500">All your harvest listings</p>
          </div>
          <Link
            href="/farmer/listings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <span>＋</span> New listing
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-8">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 shadow-[0_12px_28px_rgba(16,185,129,0.08)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">District matching</p>
          <h3 className="mt-2 text-xl font-black text-zinc-900">{district} zone coverage</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearbyDistricts.slice(0, 6).map((item) => (
              <span key={item.name} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                {item.name} · {item.distanceKm} km
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <SmsSendCard
            phone="+94771234567"
            message="Your harvest listing is live. Retailers in nearby districts can view and order now."
          />
        </div>

        {!listings?.length ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white p-16 text-center shadow-[0_30px_80px_rgba(16,24,40,0.04)]">
            <div className="mb-4 text-4xl">🌱</div>
            <h4 className="font-black text-zinc-900">No listings yet</h4>
            <p className="mt-1 mb-6 text-sm text-zinc-500">Start by publishing your upcoming harvest.</p>
            <Link href="/farmer/listings/new" className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
              Create first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-6 py-3">Crop</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">MOQ</th>
                  <th className="px-4 py-3">Price/kg</th>
                  <th className="px-4 py-3">Harvest from</th>
                  <th className="px-6 py-3 text-right">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-50/80">
                    <td className="px-6 py-4 font-bold text-zinc-900">{l.crop_name}</td>
                    <td className="px-4 py-4"><ListingStatusBadge status={l.status} /></td>
                    <td className="px-4 py-4 text-zinc-700">{Number(l.quantity_kg).toLocaleString()} kg</td>
                    <td className="px-4 py-4 text-zinc-700">{Number(l.moq_kg).toLocaleString()} kg</td>
                    <td className="px-4 py-4 font-bold text-zinc-900">LKR {l.base_price_lkr}</td>
                    <td className="px-4 py-4 text-zinc-500">{l.available_from}</td>
                    <td className="px-6 py-4 text-right text-zinc-500">{l.available_until}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
