'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listingSchema, ListingSchema } from '@/lib/validations/schemas'
import Link from 'next/link'

export default function NewListingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ListingSchema>({
    resolver: zodResolver(listingSchema),
    defaultValues: { quantity_kg: 0, base_price_lkr: 0, moq_kg: 0 },
  })

  async function onSubmit(data: ListingSchema) {
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let { data: farm } = await supabase
      .from('farms').select('id').eq('owner_id', user.id).maybeSingle()

    if (!farm) {
      const { data: profile } = await supabase
        .from('users').select('full_name, district').eq('id', user.id).single()
      const { data: newFarm, error: farmError } = await supabase.from('farms').insert({
        owner_id: user.id,
        name: `${profile?.full_name ?? 'My'}'s Farm`,
        district: profile?.district ?? 'Colombo',
      }).select('id').single()

      if (farmError) {
        setError(farmError.message)
        setLoading(false)
        return
      }
      farm = newFarm
    }

    const { error: insertError } = await supabase.from('harvest_listings').insert({
      farm_id: farm!.id,
      crop_name: data.crop_name,
      quantity_kg: data.quantity_kg,
      base_price_lkr: data.base_price_lkr,
      moq_kg: data.moq_kg,
      available_from: data.available_from,
      available_until: data.available_until,
      description: data.description,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/farmer/dashboard')
  }

  const renderField = (label: string, name: keyof ListingSchema, type = 'text', placeholder = '') => (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">{label}</label>
      <input
        type={type}
        {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
      />
      {errors[name] && (
        <p className="mt-1 text-xs font-medium text-red-500">⚠️ {errors[name]?.message as string}</p>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#f1f5f9_100%)] lg:flex-row">
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-8 text-white lg:w-96 lg:p-12">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-900/60 to-emerald-950/95" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <Link
              href="/farmer/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-white/10"
            >
              ← Return to hub
            </Link>

            <div className="mt-8 space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">Wholesale marketplace</span>
              <h2 className="text-3xl font-black leading-tight">Broadcast your upcoming harvest</h2>
              <p className="text-sm leading-relaxed text-emerald-100/75">
                Fill out your batch metrics. Once published, the platform can match your produce with nearby retail buyers and logistics groups.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white">Pro-farmer tip</h4>
                <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
                  Set your availability window 3–5 days ahead so retailers have enough time to coordinate pickup and delivery pools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-3xl flex-1 flex-col justify-center p-6 lg:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Yield batch declaration</h1>
          <p className="mt-1 text-xs text-zinc-500">Define your volume, price, and delivery window for the next market cycle.</p>
        </div>

        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(16,24,40,0.06)] lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderField('Crop / produce name', 'crop_name', 'text', 'e.g., Keeri Samba Paddy, red onions, carrots')}

            <div className="grid gap-5 sm:grid-cols-2">
              {renderField('Total stock available (kg)', 'quantity_kg', 'number', 'e.g., 1500')}
              {renderField('Minimum order quantity (kg)', 'moq_kg', 'number', 'e.g., 200')}
            </div>

            {renderField('Wholesale target price per kg (LKR)', 'base_price_lkr', 'number', 'e.g., 280')}

            <div className="grid gap-5 sm:grid-cols-2">
              {renderField('Harvest availability commences', 'available_from', 'date')}
              {renderField('Listing expiration deadline', 'available_until', 'date')}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Additional batch specification</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Detail grading, quality notes, packing requirements, or collection preferences..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end border-t border-zinc-100 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
              >
                {loading ? 'Publishing yield entry...' : '🌾 Publish active listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}