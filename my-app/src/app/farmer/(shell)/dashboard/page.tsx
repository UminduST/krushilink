import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/session'
import { ListingStatusBadge } from '@/components/ui/StatusBadge'
import { AiAssistantPopup } from '@/components/ui/AiAssistantPopup'
import type { HarvestListing } from '@/lib/types'

export default async function FarmerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getUserProfile(user.id)

  const { data: farms } = await supabase
    .from('farms')
    .select('id')
    .eq('owner_id', user.id)

  const farmIds = farms?.map((f) => f.id) ?? []
  const { data: listings } = farmIds.length > 0
    ? await supabase.from('harvest_listings')
        .select('*')
        .in('farm_id', farmIds)
        .order('created_at', { ascending: false })
    : { data: [] as HarvestListing[] }

  const active = listings?.filter((l) => l.status === 'open' || l.status === 'pool_active') ?? []
  const fulfilled = listings?.filter((l) => l.status === 'fulfilled') ?? []
  const totalKg = listings?.reduce((sum, l) => sum + Number(l.quantity_kg), 0) ?? 0
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Live operations
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">
              Good morning, {profile?.full_name?.split(' ')[0]}!
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-right sm:block">
              <p className="text-sm font-bold text-zinc-800">{currentDate}</p>
              <p className="text-[11px] font-semibold text-zinc-500">{profile?.district ?? 'Sri Lanka'}</p>
            </div>
            <Link
              href="/farmer/listings/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <span>＋</span> Add new yield
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-8">
        <AiAssistantPopup />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Active listings', value: active.length, accent: 'emerald', icon: '🟢' },
            { label: 'Total listings', value: listings?.length ?? 0, accent: 'teal', icon: '🌾' },
            { label: 'Fulfilled', value: fulfilled.length, accent: 'amber', icon: '📦' },
            { label: 'Volume listed', value: `${totalKg.toLocaleString()} kg`, accent: 'cyan', icon: '⚖️' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{s.label}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-lg">{s.icon}</span>
              </div>
              <div className="mt-5 text-3xl font-black tracking-tight text-zinc-900">{s.value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <div>
                <h3 className="text-lg font-black text-zinc-900">Recent crop listings</h3>
                <p className="mt-1 text-xs text-zinc-500">Your latest harvest entries</p>
              </div>
              <Link href="/farmer/listings" className="text-xs font-bold text-emerald-600 hover:underline">
                View all →
              </Link>
            </div>

            {!listings?.length ? (
              <div className="p-16 text-center">
                <div className="mb-4 text-4xl">🌱</div>
                <h4 className="font-bold text-zinc-800">No listings yet</h4>
                <p className="mt-1 text-sm text-zinc-500">Publish your first harvest to connect with retailers.</p>
                <Link
                  href="/farmer/listings/new"
                  className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Create listing
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                      <th className="px-6 py-3">Crop</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Price/kg</th>
                      <th className="px-6 py-3 text-right">Available until</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {listings.slice(0, 5).map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-50/80">
                        <td className="px-6 py-4 font-bold text-zinc-900">{l.crop_name}</td>
                        <td className="px-4 py-4">
                          <ListingStatusBadge status={l.status} />
                        </td>
                        <td className="px-4 py-4 font-semibold text-zinc-700">{Number(l.quantity_kg).toLocaleString()} kg</td>
                        <td className="px-4 py-4 font-bold text-zinc-900">LKR {l.base_price_lkr}</td>
                        <td className="px-6 py-4 text-right text-zinc-500">{l.available_until}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 shadow-[0_12px_28px_rgba(16,185,129,0.08)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Performance</p>
            <h3 className="mt-2 text-xl font-black text-zinc-900">Farm snapshot</h3>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Open demand', value: active.length, color: 'bg-emerald-500' },
                { label: 'Fulfilled', value: fulfilled.length, color: 'bg-amber-500' },
                { label: 'Average yield', value: `${Math.max(1, Math.round(totalKg / Math.max(1, listings?.length ?? 1)))} kg`, color: 'bg-cyan-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-600">{item.label}</span>
                    <span className="font-black text-zinc-900">{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/80">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, item.label === 'Open demand' ? active.length * 24 : item.label === 'Fulfilled' ? fulfilled.length * 28 : 72)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
