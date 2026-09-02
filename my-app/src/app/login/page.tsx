'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, LoginSchema } from '@/lib/validations/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginSchema) {
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const role = authData.user?.user_metadata?.role as string | undefined
    setLoading(false)
    router.push(role === 'retailer' ? '/retailer/dashboard' : '/farmer/dashboard')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#f1f5f9_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(16,24,40,0.08)]">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-8 pb-8 pt-10 text-white">
          <div className="mb-5 flex items-center gap-3 text-xl font-black">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-lg">🌾</span>
            KrushiLink
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-emerald-50/80">Access your farmer or retailer portal</p>
        </div>

        <div className="p-8 lg:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Email</label>
              <input {...register('email')} type="email"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Password</label>
              <input {...register('password')} type="password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                placeholder="Your password" />
              {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>

            {error && <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New here? <Link href="/register" className="font-semibold text-emerald-600 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
