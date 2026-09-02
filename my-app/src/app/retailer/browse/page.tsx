'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ListingStatusBadge } from '@/components/ui/StatusBadge'
import { DistrictMapCard } from '@/components/ui/DistrictMapCard'
import { getNearbyDistricts } from '@/lib/maps/districts'
import type { HarvestListing } from '@/lib/types'

type ListingWithFarm = HarvestListing & {
  farms: { name: string; district: string } | null
}

export default function RetailerBrowsePage() {
  const [listings, setListings] = useState<ListingWithFarm[]>([])
  const [district, setDistrict] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [district])

  async function loadListings() {
    setLoading(true)
    const supabase = createClient()
    const query = supabase
      .from('harvest_listings')
      .select('*, farms(name, district)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    const { data } = await query
    let results = (data ?? []) as ListingWithFarm[]

    if (district) {
      results = results.filter((l) => l.farms?.district === district)
    }

    setListings(results)
    setLoading(false)
  }

  async function joinPool(listingId: string, moqKg: number) {
    setJoining(listingId)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pool } = await supabase
      .from('demand_pools')
      .select('id, moq_kg, total_committed_kg')
      .eq('listing_id', listingId)
      .eq('status', 'open')
      .maybeSingle()

    if (!pool) {
      setMessage('No open pool found for this listing.')
      setJoining(null)
      return
    }

    const qty = Math.min(Number(moqKg), 100)
    const { error } = await supabase.from('pool_orders').insert({
      pool_id: pool.id,
      retailer_id: user.id,
      quantity_kg: qty,
    })

    if (error) {
      setMessage(error.message)
    } else {
      await supabase.from('demand_pools').update({
        total_committed_kg: Number(pool.total_committed_kg) + qty,
      }).eq('id', pool.id)
      setMessage('Successfully joined the demand pool!')
      loadListings()
    }
    setJoining(null)
  }

  const districts = [...new Set(listings.map((l) => l.farms?.district).filter(Boolean))]
  const districtMatches = useMemo(
    () => getNearbyDistricts(district || 'Colombo', 80),
    [district],
  )

  return (
    <>
      <header className="border-b border-blue-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Browse harvests</h1>
            <p className="mt-1 text-sm text-zinc-500">Open listings from farmers across Sri Lanka</p>
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-blue-400"
          >
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-8">
        {message && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        )}

        <DistrictMapCard district={district || 'Colombo'} nearbyDistricts={districtMatches} />

        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Loading harvests...
          </div>
        ) : !listings.length ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white p-16 text-center shadow-[0_30px_80px_rgba(16,24,40,0.04)]">
            <div className="mb-4 text-4xl">🌾</div>
            <h4 className="font-black text-zinc-900">No open harvests</h4>
            <p className="mt-1 text-sm text-zinc-500">Check back soon for new farmer listings.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((l) => (
              <div key={l.id} className="flex flex-col rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(37,99,235,0.08)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black tracking-tight text-zinc-900">{l.crop_name}</h3>
                  <ListingStatusBadge status={l.status} />
                </div>

                <p className="text-sm text-zinc-500">{l.farms?.name} · {l.farms?.district}</p>

                <dl className="mt-5 flex-1 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                    <dt className="text-zinc-500">Available</dt>
                    <dd className="font-bold text-zinc-900">{Number(l.quantity_kg).toLocaleString()} kg</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                    <dt className="text-zinc-500">MOQ</dt>
                    <dd className="font-bold text-zinc-900">{Number(l.moq_kg).toLocaleString()} kg</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                    <dt className="text-zinc-500">Price</dt>
                    <dd className="font-black text-emerald-700">LKR {l.base_price_lkr}/kg</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                    <dt className="text-zinc-500">Harvest from</dt>
                    <dd className="font-semibold text-zinc-700">{l.available_from}</dd>
                  </div>
                </dl>

                <button
                  onClick={() => joinPool(l.id, l.moq_kg)}
                  disabled={joining === l.id}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {joining === l.id ? 'Joining...' : 'Join demand pool'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
