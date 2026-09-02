'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@/lib/types'

const navItems = [
  { href: '/retailer/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/retailer/browse', label: 'Browse harvests', icon: '🛒' },
  { href: '/retailer/payments', label: 'Payments', icon: '💳' },
]

export function RetailerSidebar({ profile }: { profile: User | null }) {
  const pathname = usePathname()

  return (
    <aside className="fixed z-20 hidden h-screen w-64 flex-col justify-between border-r border-blue-100 bg-gradient-to-b from-white via-blue-50/25 to-white lg:flex">
      <div>
        <div className="flex items-center gap-3 border-b border-blue-100 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-600/20">
            🏪
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900">KrushiLink</span>
        </div>

        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-zinc-600 hover:bg-white hover:text-zinc-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-blue-100 bg-white/80 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-blue-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-bold text-zinc-900">{profile?.full_name}</h4>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {profile?.role || 'Retailer'} partner
            </p>
          </div>
        </div>
        <Link
          href="/logout"
          className="block rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-bold text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Log out
        </Link>
      </div>
    </aside>
  )
}
