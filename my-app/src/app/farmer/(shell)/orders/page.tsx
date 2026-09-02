import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PoolStatusBadge } from '@/components/ui/StatusBadge'

export default async function FarmerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: farms } = await supabase.from('farms').select('id').eq('owner_id', user.id)
  const farmIds = farms?.map((f) => f.id) ?? []

  let pools: Array<{
    id: string
    district: string
    total_committed_kg: number
    moq_kg: number
    status: 'open' | 'closed' | 'dispatched' | 'completed'
    closes_at: string
    harvest_listings: { crop_name: string; quantity_kg: number } | null
  }> = []

  if (farmIds.length > 0) {
    const { data: listingIds } = await supabase
      .from('harvest_listings')
      .select('id')
      .in('farm_id', farmIds)

    const ids = listingIds?.map((l) => l.id) ?? []
    if (ids.length > 0) {
      const { data } = await supabase
        .from('demand_pools')
        .select('*, harvest_listings(crop_name, quantity_kg)')
        .in('listing_id', ids)
        .order('created_at', { ascending: false })
      pools = (data ?? []) as typeof pools
    }
  }

  return (
    <>
      <header className="border-b border-emerald-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Orders & demand pools</h1>
        <p className="mt-1 text-sm text-zinc-500">Track retailer commitments on your listings</p>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        {!pools.length ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white p-16 text-center shadow-[0_30px_80px_rgba(16,24,40,0.04)]">
            <div className="mb-4 text-4xl">📦</div>
            <h4 className="font-black text-zinc-900">No demand pools yet</h4>
            <p className="mt-1 mb-6 text-sm text-zinc-500">
              Pools are created automatically when you publish a harvest listing.
            </p>
            <Link href="/farmer/listings/new" className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
              Publish a harvest
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pools.map((pool) => {
              const progress = Math.min(100, (Number(pool.total_committed_kg) / Number(pool.moq_kg)) * 100)
              return (
                <div key={pool.id} className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">
                        {pool.harvest_listings?.crop_name ?? 'Harvest pool'}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">{pool.district} district · Closes {new Date(pool.closes_at).toLocaleDateString()}</p>
                    </div>
                    <PoolStatusBadge status={pool.status} />
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-600">
                      <span>{Number(pool.total_committed_kg).toLocaleString()} kg committed</span>
                      <span>MOQ: {Number(pool.moq_kg).toLocaleString()} kg</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
