'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, RegisterSchema, SL_DISTRICTS } from '@/lib/validations/schemas'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'farmer'
    }
  })

  const selectedRole = watch('role')

  async function saveProfile(data: RegisterSchema) {
    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        district: data.district,
      }),
    })

    if (!res.ok) {
      const result = await res.json().catch(() => ({}))
      throw new Error(
        typeof result.error === 'string'
          ? result.detail
            ? `${result.error} (${result.detail})`
            : result.error
          : 'Could not save profile'
      )
    }
  }

  async function signInAfterRegister(email: string, password: string, role: RegisterSchema['role']) {
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Account created. Please sign in — ' + signInError.message)
      setLoading(false)
      router.push('/login')
      return
    }

    setLoading(false)
    router.push(`/${role}/dashboard`)
  }

  async function onSubmit(data: RegisterSchema) {
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await res.json().catch(() => ({}))

    if (res.ok) {
      await signInAfterRegister(data.email, data.password, data.role)
      return
    }

    const useClientFallback =
      res.status === 500 &&
      typeof result.error === 'string' &&
      result.error.includes('SUPABASE_SERVICE_ROLE_KEY')

    if (useClientFallback) {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: data.full_name,
            phone: data.phone,
            district: data.district,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      try {
        await saveProfile(data)
      } catch (profileErr) {
        setError(profileErr instanceof Error ? profileErr.message : 'Could not save profile')
        setLoading(false)
        return
      }

      await signInAfterRegister(data.email, data.password, data.role)
      return
    }

    setError(
      typeof result.error === 'string'
        ? result.detail
          ? `${result.error} (${result.detail})`
          : result.error
        : 'Registration failed'
    )
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#f1f5f9_100%)] p-0 md:p-6">
      <div className="grid min-h-[500px] w-full max-w-5xl overflow-hidden rounded-none border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(16,24,40,0.08)] md:mx-auto md:rounded-[28px] md:grid-cols-12">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-12 md:col-span-5 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-900/85 to-emerald-800/90" />

          <div className="relative z-10 flex items-center gap-3 text-xl font-black text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg">🌾</span>
            KrushiLink
          </div>

          <div className="relative z-10 mt-auto">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Grow with us</span>
            <h2 className="mb-4 text-3xl font-black leading-tight text-white">Maximize your harvest value</h2>
            <p className="text-sm leading-relaxed text-emerald-100/80">
              Join thousands of merchants managing fresh yields directly from fields to processing facilities across every district.
            </p>
          </div>
        </div>

        <div className="flex max-h-screen flex-col justify-center overflow-y-auto bg-white p-8 md:col-span-7 lg:p-12">
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Create your account</h1>
            <p className="mt-1 text-xs text-zinc-500">Select your business type profile below to begin registration</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {(['farmer', 'retailer'] as const).map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-3 text-center transition-all ${
                  selectedRole === r ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                <input type="radio" value={r} {...register('role')} className="sr-only" />
                <span className="text-xl">{r === 'farmer' ? '🌾' : '🏪'}</span>
                <span className="text-sm font-semibold capitalize">{r} portal</span>
              </label>
            ))}
          </div>
          {errors.role && <p className="mb-3 text-xs font-medium text-red-500">{errors.role.message}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Full name</label>
                <input {...register('full_name')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Kamal Perera" />
                {errors.full_name && <p className="mt-1 text-xs font-medium text-red-500">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Phone number</label>
                <input {...register('phone')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="+94771234567" />
                {errors.phone && <p className="mt-1 text-xs font-medium text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Email address</label>
              <input {...register('email')} type="email"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                placeholder="kamal@example.com" />
              {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Password</label>
                <input {...register('password')} type="password"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Min. 8 characters" />
                {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">District location</label>
                <select {...register('district')}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white">
                  <option value="">Select district</option>
                  {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="mt-1 text-xs font-medium text-red-500">{errors.district.message}</p>}
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Complete registration'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account? <a href="/login" className="font-semibold text-emerald-600 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}