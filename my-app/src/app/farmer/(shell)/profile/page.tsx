'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, ProfileSchema, SL_DISTRICTS } from '@/lib/validations/schemas'

export default function FarmerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
      const { data: farm } = await supabase.from('farms').select('name').eq('owner_id', user.id).maybeSingle()

      reset({
        full_name: profile?.full_name ?? '',
        phone: profile?.phone ?? '',
        district: (profile?.district as ProfileSchema['district']) ?? 'Colombo',
        farm_name: farm?.name ?? '',
      })
      setLoading(false)
    }
    load()
  }, [reset])

  async function onSubmit(data: ProfileSchema) {
    setSaving(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: profileError } = await supabase.from('users').update({
      full_name: data.full_name,
      phone: data.phone,
      district: data.district,
    }).eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
      setSaving(false)
      return
    }

    const { data: existingFarm } = await supabase.from('farms').select('id').eq('owner_id', user.id).maybeSingle()

    if (existingFarm) {
      await supabase.from('farms').update({
        name: data.farm_name ?? `${data.full_name}'s Farm`,
        district: data.district,
      }).eq('id', existingFarm.id)
    } else if (data.farm_name) {
      await supabase.from('farms').insert({
        owner_id: user.id,
        name: data.farm_name,
        district: data.district,
      })
    }

    setMessage('Profile saved successfully.')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">Loading profile...</div>
    )
  }

  return (
    <>
      <header className="border-b border-emerald-100 bg-white/85 px-8 py-5 backdrop-blur-xl">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Farm profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account and farm details</p>
      </header>

      <main className="mx-auto max-w-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_30px_80px_rgba(16,24,40,0.04)]">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Full name</label>
            <input {...register('full_name')} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white" />
            {errors.full_name && <p className="mt-1 text-xs font-medium text-red-500">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Phone</label>
            <input {...register('phone')} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white" placeholder="+94771234567" />
            {errors.phone && <p className="mt-1 text-xs font-medium text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">District</label>
            <select {...register('district')} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400">
              {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="mt-1 text-xs font-medium text-red-500">{errors.district.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Farm name</label>
            <input {...register('farm_name')} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white" placeholder="Green Valley Farm" />
            {errors.farm_name && <p className="mt-1 text-xs font-medium text-red-500">{errors.farm_name.message}</p>}
          </div>

          {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">{message}</p>}

          <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </main>
    </>
  )
}
